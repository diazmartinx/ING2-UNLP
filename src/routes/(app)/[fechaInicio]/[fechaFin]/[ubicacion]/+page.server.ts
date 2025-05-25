import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales, usuarios } from '$lib/server/db/schema';
import { eq, and, or, not, exists, gt, lt, lte, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { json } from '@sveltejs/kit';

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
        nombreSucursal: sucursales.nombre,
        direccionSucursal: sucursales.direccion
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

export const actions = {
    tieneReservasEnRango: async ({ request, locals }) => {
        const data = await request.formData();
        const fechaInicio = String(data.get('fechaInicio'));
        const fechaFin = String(data.get('fechaFin'));

        console.log('Fechas recibidas:', fechaInicio, fechaFin);

        const session = locals.session;

        if (session === null || session === undefined) {
            return { solapamiento: false };
        }

        const usuario = await db.select().from(usuarios).where(eq(usuarios.id, session.userId));

        if (!usuario || usuario.length === 0) {
            return { solapamiento: false };
        }

        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);

        const reservasPendientes = await db
            .select()
            .from(reservas)
            .where(
                and(
                    eq(reservas.idUsuario, usuario[0].id),
                    eq(reservas.estado, 'Pendiente'),
                    and(
                        lte(reservas.fechaInicio, fechaFinDate),
                        gte(reservas.fechaFin, fechaInicioDate)
                    )
                )
            );

        return { solapamiento: reservasPendientes.length > 0 };
    }
};