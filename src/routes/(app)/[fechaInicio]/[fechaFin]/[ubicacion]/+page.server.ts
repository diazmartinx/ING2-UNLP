import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales, usuarios } from '$lib/server/db/schema';
import { eq, and, or, not, exists, lte, gte, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { json, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;
    const ubicacionDecoded = decodeURIComponent(ubicacion);

    // Validar que los parámetros sean fechas válidas
    if (!fechaInicio.match(/^\d{4}-\d{2}-\d{2}$/) || !fechaFin.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw error(400, 'Fechas inválidas');
    }

    console.log('Parámetros recibidos:', {
        fechaInicio,
        fechaFin,
        ubicacion: ubicacionDecoded
    });

    // Verificar si el usuario tiene una sesión iniciada
    const session = locals.session;
    let isLoggedIn = false;
    if (session) {
        isLoggedIn = true;
    }

    // Crear fechas en GMT-3 para comparar correctamente con la base
    const fechaInicioDate = new Date(`${fechaInicio}T00:00:00-03:00`);
    const fechaFinDate = new Date(`${fechaFin}T23:59:59-03:00`);

    console.log('Fechas procesadas:', {
        fechaInicio: fechaInicioDate.toISOString(),
        fechaFin: fechaFinDate.toISOString()
    });

    // Get all branches
    const sucursalesList = await db.select({
        nombre: sucursales.nombre
    })
        .from(sucursales)
        .orderBy(sucursales.nombre);

    // Get total units per model in the branch
    const totalUnidadesPorModelo = await db.select({
        idModelo: modelosVehiculos.id,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        total: sql<number>`count(*)`
    })
        .from(unidadesVehiculos)
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .where(
            and(
                eq(unidadesVehiculos.estado, 'Habilitado'),
                eq(sucursales.nombre, ubicacionDecoded)
            )
        )
        .groupBy(modelosVehiculos.id, modelosVehiculos.marca, modelosVehiculos.modelo);

    console.log('Total unidades por modelo:', totalUnidadesPorModelo);

    // Convert to Map for easy lookup
    const totalUnidadesMap = new Map(
        totalUnidadesPorModelo.map(item => [item.idModelo, item.total])
    );

    // Get available vehicles with a single query
    const unidadesDisponibles = await db.select({
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        anio: unidadesVehiculos.anio,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenBlob: modelosVehiculos.imagenBlob,
        nombreSucursal: sucursales.nombre,
        direccionSucursal: sucursales.direccion,
        patente: unidadesVehiculos.patente,
        idModelo: modelosVehiculos.id
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
                                eq(reservas.estado, 'Entregada'),
                                or(
                                    // La reserva empieza dentro del rango buscado
                                    and(
                                        gte(reservas.fechaInicio, fechaInicioDate),
                                        lte(reservas.fechaInicio, fechaFinDate)
                                    ),
                                    // La reserva termina dentro del rango buscado
                                    and(
                                        gte(reservas.fechaFin, fechaInicioDate),
                                        lte(reservas.fechaFin, fechaFinDate)
                                    ),
                                    // La reserva contiene completamente el rango buscado
                                    and(
                                        lte(reservas.fechaInicio, fechaInicioDate),
                                        gte(reservas.fechaFin, fechaFinDate)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );

    // Debug: Get all reservations for the date range
    const reservasEnRango = await db.select({
        id: reservas.id,
        patente: reservas.patenteUnidadAsignada,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo
    })
    .from(reservas)
    .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente))
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
    .where(
        and(
            eq(sucursales.nombre, ubicacionDecoded),
            eq(reservas.estado, 'Entregada'),
            or(
                // La reserva empieza dentro del rango buscado
                and(
                    gte(reservas.fechaInicio, fechaInicioDate),
                    lte(reservas.fechaInicio, fechaFinDate)
                ),
                // La reserva termina dentro del rango buscado
                and(
                    gte(reservas.fechaFin, fechaInicioDate),
                    lte(reservas.fechaFin, fechaFinDate)
                ),
                // La reserva contiene completamente el rango buscado
                and(
                    lte(reservas.fechaInicio, fechaInicioDate),
                    gte(reservas.fechaFin, fechaFinDate)
                )
            )
        )
    );

    console.log('Reservas en el rango de fechas:', reservasEnRango);

    // Debug: Get all units in the branch
    const todasLasUnidades = await db.select({
        patente: unidadesVehiculos.patente,
        estado: unidadesVehiculos.estado,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo
    })
    .from(unidadesVehiculos)
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
    .where(
        and(
            eq(sucursales.nombre, ubicacionDecoded),
            eq(unidadesVehiculos.estado, 'Habilitado')
        )
    );

    console.log('Todas las unidades en la sucursal:', todasLasUnidades);

    console.log('Unidades disponibles (sin agrupar):', unidadesDisponibles.map(u => ({
        patente: u.patente,
        marca: u.marca,
        modelo: u.modelo,
        idModelo: u.idModelo
    })));

    // Agrupar unidades por modelo
    const unidadesAgrupadas = unidadesDisponibles.reduce((acc, unidad) => {
        const key = `${unidad.marca}-${unidad.modelo}`;
        if (!acc[key]) {
            acc[key] = {
                marca: unidad.marca,
                modelo: unidad.modelo,
                anio: unidad.anio,
                capacidadPasajeros: unidad.capacidadPasajeros,
                precioPorDia: unidad.precioPorDia,
                imagenBlob: unidad.imagenBlob,
                nombreSucursal: unidad.nombreSucursal,
                direccionSucursal: unidad.direccionSucursal,
                totalUnidades: totalUnidadesMap.get(unidad.idModelo) || 0,
                unidadesDisponibles: 1,
                idModelo: unidad.idModelo
            };
        } else {
            acc[key].unidadesDisponibles++;
        }
        return acc;
    }, {} as Record<string, any>);

    console.log('Unidades agrupadas:', Object.values(unidadesAgrupadas).map(u => ({
        marca: u.marca,
        modelo: u.modelo,
        totalUnidades: u.totalUnidades,
        unidadesDisponibles: u.unidadesDisponibles,
        idModelo: u.idModelo
    })));

    // Convertir los blobs a base64 para la serialización
    const unidadesSerializadas = Object.values(unidadesAgrupadas).map(unidad => ({
        ...unidad,
        imagenBlob: unidad.imagenBlob instanceof Buffer ? unidad.imagenBlob.toString('base64') : null
    }));

    console.log('Datos enviados al cliente:', unidadesSerializadas.map(u => ({
        marca: u.marca,
        modelo: u.modelo,
        totalUnidades: u.totalUnidades,
        unidadesDisponibles: u.unidadesDisponibles
    })));

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