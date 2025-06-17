import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales, usuarios, categoriasVehiculos } from '$lib/server/db/schema';
import { eq, and, or, not, exists, gt, lt, lte, gte, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { json, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;
    const ubicacionDecoded = decodeURIComponent(ubicacion);

    // Validar que los parámetros sean fechas válidas
    if (!fechaInicio.match(/^\d{4}-\d{2}-\d{2}$/) || !fechaFin.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw error(400, 'Fechas inválidas');
    }

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
        idModelo: modelosVehiculos.id,
        categoria: categoriasVehiculos.nombre
    })
        .from(unidadesVehiculos)
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .leftJoin(categoriasVehiculos, eq(modelosVehiculos.idCategoria, categoriasVehiculos.id))
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
                                or(
                                    eq(reservas.estado, 'Entregada'),
                                    eq(reservas.estado, 'Pendiente')
                                ),
                                // Hay solapamiento si: fechaInicio de reserva <= fechaFin buscada Y fechaFin de reserva >= fechaInicio buscada
                                and(
                                    lte(reservas.fechaInicio, fechaFinDate),
                                    gte(reservas.fechaFin, fechaInicioDate)
                                )
                            )
                        )
                    )
                )
            )
        );

    // Get reservations that overlap with the search date range
    const sucursalId = await db.select({ id: sucursales.id })
        .from(sucursales)
        .where(eq(sucursales.nombre, ubicacionDecoded))
        .limit(1);

    if (sucursalId.length === 0) {
        throw error(404, 'Sucursal no encontrada');
    }

    const reservasSolapantes = await db.select({
        id: reservas.id,
        patente: reservas.patenteUnidadAsignada,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        idModeloReservado: reservas.idModeloReservado,
        idSucursal: reservas.idSucursal
    })
    .from(reservas)
    .where(
        and(
            eq(reservas.idSucursal, sucursalId[0].id),
            or(
                eq(reservas.estado, 'Entregada'),
                eq(reservas.estado, 'Pendiente')
            ),
            // Hay solapamiento si: fechaInicio de reserva <= fechaFin buscada Y fechaFin de reserva >= fechaInicio buscada
            and(
                lte(reservas.fechaInicio, fechaFinDate),
                gte(reservas.fechaFin, fechaInicioDate)
            )
        )
    );

    // Count pending reservations by model and delivered reservations by patente
    const reservasPorModelo = new Map<number, number>();
    const patentesReservadas = new Set<string>();

    reservasSolapantes.forEach(reserva => {
        if (reserva.estado === 'Pendiente' && reserva.idModeloReservado) {
            // For pending reservations, count by model
            const count = reservasPorModelo.get(reserva.idModeloReservado) || 0;
            reservasPorModelo.set(reserva.idModeloReservado, count + 1);
        } else if (reserva.estado === 'Entregada' && reserva.patente) {
            // For delivered reservations, exclude specific patente
            patentesReservadas.add(reserva.patente);
        }
    });

    // Agrupar unidades por modelo y calcular disponibilidad real
    const unidadesAgrupadas = unidadesDisponibles
        .filter(unidad => !patentesReservadas.has(unidad.patente) && unidad.idModelo !== null) // Exclude units with delivered reservations and null idModelo
        .reduce((acc, unidad) => {
            const key = `${unidad.marca}-${unidad.modelo}`;
            if (!acc[key]) {
                const totalUnidades = totalUnidadesMap.get(unidad.idModelo!) || 0;
                const reservasPendientes = reservasPorModelo.get(unidad.idModelo!) || 0;
                acc[key] = {
                    marca: unidad.marca,
                    modelo: unidad.modelo,
                    anio: unidad.anio,
                    capacidadPasajeros: unidad.capacidadPasajeros,
                    precioPorDia: unidad.precioPorDia,
                    imagenBlob: unidad.imagenBlob,
                    nombreSucursal: unidad.nombreSucursal,
                    direccionSucursal: unidad.direccionSucursal,
                    totalUnidades: totalUnidades,
                    unidadesDisponibles: Math.max(0, totalUnidades - reservasPendientes - patentesReservadas.size),
                    idModelo: unidad.idModelo!,
                    categoria: unidad.categoria,
                    unidadesLibres: 1 // Count of units not reserved by patente
                };
            } else {
                acc[key].unidadesLibres++;
            }
            return acc;
        }, {} as Record<string, any>);

    // Recalculate unidadesDisponibles based on free units minus pending reservations per model
    Object.values(unidadesAgrupadas).forEach((grupo: any) => {
        const reservasPendientes = reservasPorModelo.get(grupo.idModelo) || 0;
        grupo.unidadesDisponibles = Math.max(0, grupo.unidadesLibres - reservasPendientes);
    });

    // Convertir los blobs a base64 para la serialización
    const unidadesSerializadas = Object.values(unidadesAgrupadas).map(unidad => ({
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