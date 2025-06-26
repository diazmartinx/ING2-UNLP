import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales, usuarios, categoriasVehiculos, adicionales } from '$lib/server/db/schema';
import { eq, and, or, not, exists, lte, gte, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;
    const ubicacionDecoded = decodeURIComponent(ubicacion);

    // Validar que los parámetros sean fechas válidas
    if (!fechaInicio.match(/^\d{4}-\d{2}-\d{2}$/) || !fechaFin.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw error(400, 'Fechas inválidas');
    }

    // Verificar si el usuario tiene una sesión iniciada
    const isLoggedIn = !!locals.session;

    // Crear fechas en GMT-3 para comparar correctamente con la base
    const fechaInicioDate = new Date(`${fechaInicio}T00:00:00-03:00`);
    const fechaFinDate = new Date(`${fechaFin}T23:59:59-03:00`);

    // Ejecutar todas las consultas en paralelo para mejor performance
    const [sucursalesList, sucursalId, adicionalesDisponibles] = await Promise.all([
        // Get all branches
        db.select({ nombre: sucursales.nombre })
            .from(sucursales)
            .orderBy(sucursales.nombre),
        
        // Get sucursal ID for the specific location
        db.select({ id: sucursales.id })
            .from(sucursales)
            .where(eq(sucursales.nombre, ubicacionDecoded))
            .limit(1),
        
        // Get adicionales
        db.select().from(adicionales)
    ]);

    if (sucursalId.length === 0) {
        throw error(404, 'Sucursal no encontrada');
    }

    // Get total units per model in the branch (optimized query)
    const totalUnidadesPorModelo = await db.select({
        idModelo: modelosVehiculos.id,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        total: sql<number>`count(*)`
    })
        .from(unidadesVehiculos)
        .innerJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .innerJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .where(
            and(
                eq(unidadesVehiculos.estado, 'Habilitado'),
                eq(sucursales.nombre, ubicacionDecoded)
            )
        )
        .groupBy(modelosVehiculos.id, modelosVehiculos.marca, modelosVehiculos.modelo);

    // Convert to Map for O(1) lookup
    const totalUnidadesMap = new Map(
        totalUnidadesPorModelo.map(item => [item.idModelo, item.total])
    );

    // Get reservations that overlap with the search date range
    const reservasSolapantes = await db.select({
        id: reservas.id,
        patente: reservas.patenteUnidadAsignada,
        estado: reservas.estado,
        idModeloReservado: reservas.idModeloReservado
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

    // Process reservations data efficiently
    const reservasPorModelo = new Map<number, number>();
    const patentesReservadas = new Set<string>();

    for (const reserva of reservasSolapantes) {
        if (reserva.estado === 'Pendiente' && reserva.idModeloReservado) {
            reservasPorModelo.set(
                reserva.idModeloReservado, 
                (reservasPorModelo.get(reserva.idModeloReservado) || 0) + 1
            );
        } else if (reserva.estado === 'Entregada' && reserva.patente) {
            patentesReservadas.add(reserva.patente);
        }
    }

    // Get available vehicles with optimized query
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
        .innerJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .innerJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
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

    // Agrupar unidades por modelo y calcular disponibilidad real (optimized)
    const unidadesAgrupadas = new Map<string, any>();

    for (const unidad of unidadesDisponibles) {
        if (patentesReservadas.has(unidad.patente) || !unidad.idModelo) continue;

        const key = `${unidad.marca}-${unidad.modelo}`;
        
        if (!unidadesAgrupadas.has(key)) {
            const totalUnidades = totalUnidadesMap.get(unidad.idModelo) || 0;
            const reservasPendientes = reservasPorModelo.get(unidad.idModelo) || 0;
            
            unidadesAgrupadas.set(key, {
                marca: unidad.marca,
                modelo: unidad.modelo,
                anio: unidad.anio,
                capacidadPasajeros: unidad.capacidadPasajeros,
                precioPorDia: unidad.precioPorDia,
                imagenBlob: unidad.imagenBlob,
                nombreSucursal: unidad.nombreSucursal,
                direccionSucursal: unidad.direccionSucursal,
                totalUnidades,
                idModelo: unidad.idModelo,
                categoria: unidad.categoria,
                unidadesLibres: 1
            });
        } else {
            const grupo = unidadesAgrupadas.get(key)!;
            grupo.unidadesLibres++;
        }
    }

    // Calculate final availability and filter out models with 0 units
    const unidadesSerializadas = Array.from(unidadesAgrupadas.values())
        .map(grupo => {
            const reservasPendientes = reservasPorModelo.get(grupo.idModelo) || 0;
            const unidadesDisponibles = Math.max(0, grupo.unidadesLibres - reservasPendientes);
            
            return {
                ...grupo,
                unidadesDisponibles,
                imagenBlob: grupo.imagenBlob instanceof Buffer ? grupo.imagenBlob.toString('base64') : null
            };
        })
        .filter(unidad => unidad.unidadesDisponibles > 0);

    return {
        fechaInicio,
        fechaFin,
        ubicacion: ubicacionDecoded,
        sucursales: sucursalesList.map(s => s.nombre),
        unidadesDisponibles: unidadesSerializadas,
        adicionalesDisponibles,
        isLoggedIn
    };
};

export const actions = {
    tieneReservasEnRango: async ({ request, locals }) => {
        const data = await request.formData();
        const fechaInicio = String(data.get('fechaInicio'));
        const fechaFin = String(data.get('fechaFin'));

        const session = locals.session;
        if (!session) {
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