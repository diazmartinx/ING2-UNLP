import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { reservas, unidadesVehiculos, usuarios, modelosVehiculos } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
    const id = Number(params.id);
    
    if (isNaN(id)) {
        return {
            error: 'ID de reserva inválido'
        };
    }

    const reserva = await db.select({
        id: reservas.id,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        fechaCreacion: reservas.fechaCreacion,
        estado: reservas.estado,
        dniCliente: usuarios.dni,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        nombreCliente: usuarios.nombre,
        apellidoCliente: usuarios.apellido,
        emailCliente: usuarios.email,
        telefonoCliente: usuarios.telefono,
        modeloVehiculoReservado: sql<string>`(SELECT idModelo FROM unidades_vehiculos WHERE patente = ${reservas.patenteUnidadAsignada})`,
        modeloVehiculoAsignado: sql<string>`(SELECT idModelo FROM unidades_vehiculos WHERE patente = ${reservas.patenteUnidadAsignada})`,
        anioVehiculoReservado: sql<number>`(SELECT anio FROM unidades_vehiculos WHERE patente = ${reservas.patenteUnidadAsignada})`,
        anioVehiculoAsignado: sql<number>`(SELECT anio FROM unidades_vehiculos WHERE patente = ${reservas.patenteUnidadAsignada})`,
        marcaVehiculoReservado: sql<string>`(SELECT m.marca FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        marcaVehiculoAsignado: sql<string>`(SELECT m.marca FROM unidades_vehiculos uv JOIN modelos_vehiculos m ON uv.idModelo = m.id WHERE uv.patente = ${reservas.patenteUnidadAsignada})`,
        nombreModeloReservado: sql<string>`(SELECT m.modelo FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        nombreModeloAsignado: sql<string>`(SELECT m.modelo FROM unidades_vehiculos uv JOIN modelos_vehiculos m ON uv.idModelo = m.id WHERE uv.patente = ${reservas.patenteUnidadAsignada})`,
        precioPorDia: modelosVehiculos.precioPorDia,
        importeTotal: reservas.importeTotal
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente))
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .where(eq(reservas.id, id))
    .limit(1);

    if (!reserva || reserva.length === 0) {
        return {
            error: 'La reserva especificada no existe'
        };
    }

    return {
        reserva: reserva[0]
    };
}) satisfies PageServerLoad; 