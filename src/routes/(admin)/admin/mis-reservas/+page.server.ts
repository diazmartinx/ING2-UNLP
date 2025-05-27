import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { reservas, unidadesVehiculos, modelosVehiculos, usuarios, politicasCancelacion, sucursales } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

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

    const reservasUsuario = await db.select({
        id: reservas.id,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        estado: reservas.estado,
        importeTotal: reservas.importeTotal,
        fechaCreacion: reservas.fechaCreacion,
        modeloReservado: sql<string>`(SELECT m.modelo FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        marcaReservada: sql<string>`(SELECT m.marca FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        anioReservado: sql<number>`(SELECT uv.anio FROM unidades_vehiculos uv WHERE uv.idModelo = ${reservas.idModeloReservado} LIMIT 1)`,
        patenteAsignada: reservas.patenteUnidadAsignada
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .leftJoin(modelosVehiculos, eq(reservas.idModeloReservado, modelosVehiculos.id))
    .where(eq(reservas.idUsuario, session.userId))
    .orderBy(desc(reservas.fechaCreacion));

    return {
        reservas: reservasUsuario
    };
}) satisfies PageServerLoad; 

export const actions: Actions = {
    cancelarReserva: async ({ request }) => {
        const data = await request.formData();
        const idReserva = Number(data.get('idReserva'));

        try {
            await db.update(reservas)
                .set({ estado: 'Cancelada' })
                .where(eq(reservas.id, idReserva));
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            return { success: false, error: (error as any).message };
        }

        return { success: true };
    }
};