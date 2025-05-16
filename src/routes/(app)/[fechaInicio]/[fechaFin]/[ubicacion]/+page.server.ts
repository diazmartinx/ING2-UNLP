import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales } from '$lib/server/db/schema';
import { eq, and, or, not, exists, gt, lt, lte, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ params, locals }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;
    const ubicacionDecoded = decodeURIComponent(ubicacion);

    // Verificar si el usuario tiene una sesión iniciada
    const session = locals.session;
    let isLoggedIn = false;
    if (session) {
        isLoggedIn = true;
    }

    // Crear fechas en GMT-3 para comparar correctamente con la base
    const fechaInicioDate = new Date(`${fechaInicio}T00:00:00-03:00`);
    const fechaFinDate = new Date(`${fechaFin}T23:59:59-03:00`);

    // Get all branches
    const sucursalesList = await db.select({
        nombre: sucursales.nombre
    })
        .from(sucursales)
        .orderBy(sucursales.nombre);

    // Get available vehicles
    const unidadesDisponibles = await db.select({
        patente: unidadesVehiculos.patente,
        estado: unidadesVehiculos.estado,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        anio: unidadesVehiculos.anio,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenBlob: modelosVehiculos.imagenBlob,
        nombreSucursal: sucursales.nombre
    })
        .from(unidadesVehiculos)
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .where(
            and(
                eq(unidadesVehiculos.estado, 'Habilitado'),
                eq(sucursales.nombre, ubicacionDecoded),
                not(
                    exists(
                        db.select()
                            .from(reservas)
                            .where(
                                and(
                                    eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente),
                                    gte(reservas.fechaFin, fechaInicioDate),
                                    lte(reservas.fechaInicio, fechaFinDate),
                                    or(
                                        eq(reservas.estado, 'Pendiente'),
                                        eq(reservas.estado, 'Entregada')
                                    )
                                )
                            )
                    )
                )
            )
        );

    // Convertir los blobs a base64 para la serialización
    const unidadesSerializadas = unidadesDisponibles.map(unidad => ({
        ...unidad,
        imagenBlob: unidad.imagenBlob instanceof Buffer ? unidad.imagenBlob.toString('base64') : null
    }));

    return {
        fechaInicio,
        fechaFin,
        ubicacion: ubicacionDecoded,
        sucursales: sucursalesList.map(s => s.nombre),
        unidadesDisponibles: unidadesSerializadas,
        isLoggedIn
    };
}; 