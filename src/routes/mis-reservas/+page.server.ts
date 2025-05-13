import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { reservas, unidadesVehiculos, modelosVehiculos, sucursales, usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ locals }) => {
    const session = locals.session;
    if (!session) {
        throw redirect(303, '/');
    }

    // Obtener el usuario y su rol
    const usuario = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, session.userId))
        .limit(1);

    if (!usuario.length || usuario[0].rol !== 'cliente') {
        throw error(403, 'No tienes permiso para acceder a esta página');
    }

    const reservasUsuario = await db
        .select({
            id: reservas.id,
            patente: reservas.patenteUnidadAsignada,
            fechaInicio: reservas.fechaInicio,
            fechaFin: reservas.fechaFin,
            estado: reservas.estado,
            importeTotal: reservas.importeTotal,
            marca: modelosVehiculos.marca,
            modelo: modelosVehiculos.modelo
        })
        .from(reservas)
        .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente))
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .where(eq(reservas.idUsuario, session.userId))
        .orderBy(reservas.fechaCreacion);
    return {
        reservas: reservasUsuario
    };
}) satisfies PageServerLoad; 