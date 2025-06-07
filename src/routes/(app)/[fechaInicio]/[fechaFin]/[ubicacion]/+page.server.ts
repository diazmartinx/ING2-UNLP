import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales, usuarios, categoriasVehiculos } from '$lib/server/db/schema';
import { eq, and, or, not, exists, gt, lt, lte, gte, sql } from 'drizzle-orm';
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
                eq(sucursales.nombre, ubicacionDecoded)
            )
        );

    // Verificar reservas para cada unidad
    const unidadesConReservas = await db.select({
        idModelo: reservas.idModeloReservado,
        patente: reservas.patenteUnidadAsignada,
        sucursal: sucursales.nombre,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin
    })
        .from(reservas)
        .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente))
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .where(
            and(
                or(
                    eq(reservas.estado, 'Pendiente'),
                    eq(reservas.estado, 'Entregada')
                ),
                and(
                    lte(reservas.fechaInicio, fechaFinDate),
                    gte(reservas.fechaFin, fechaInicioDate)
                )
            )
        );

    // Crear un Map con las patentes reservadas por modelo
    const reservasPorModelo = new Map();
    unidadesConReservas.forEach(reserva => {
        const key = `${reserva.idModelo}`;
        if (!reservasPorModelo.has(key)) {
            reservasPorModelo.set(key, {
                patentes: new Set(),
                reservasSinPatente: 0
            });
        }
        
        // Si tiene patente y está en la sucursal correcta
        if (reserva.patente && (!reserva.sucursal || reserva.sucursal === ubicacionDecoded)) {
            reservasPorModelo.get(key).patentes.add(reserva.patente);
        } 
        // Si no tiene patente, contamos la reserva de todas formas
        else if (!reserva.patente) {
            reservasPorModelo.get(key).reservasSinPatente++;
        }
    });

    // Agrupar unidades por modelo y contar las disponibles
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
                totalUnidades: 1,
                unidadesReservadas: 0,
                idModelo: unidad.idModelo,
                categoria: unidad.categoria,
            };
        } else {
            acc[key].totalUnidades++;
        }
        return acc;
    }, {} as Record<string, any>);

    // Actualizar las unidades reservadas por modelo
    Object.values(unidadesAgrupadas).forEach(unidad => {
        const reservas = reservasPorModelo.get(`${unidad.idModelo}`);
        if (reservas) {
            unidad.unidadesReservadas = reservas.patentes.size + reservas.reservasSinPatente;
        }
    });

    // Filtrar solo los modelos que tienen unidades disponibles
    const unidadesFinales = Object.values(unidadesAgrupadas)
        .filter(unidad => unidad.totalUnidades > unidad.unidadesReservadas)
        .map(unidad => ({
            ...unidad,
            unidadesDisponibles: unidad.totalUnidades - unidad.unidadesReservadas
        }));

    // Convertir los blobs a base64 para la serialización
    const unidadesSerializadas = unidadesFinales.map(unidad => ({
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