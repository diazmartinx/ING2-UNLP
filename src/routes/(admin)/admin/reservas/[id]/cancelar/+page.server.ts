import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { reservas, modelosVehiculos } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

type EstadoReserva = 'Pendiente' | 'Entregada' | 'Cancelada';

export const load: PageServerLoad = async ({ params }) => {
    const reserva = await db.select({
        id: reservas.id,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        modeloReservado: sql<string>`(SELECT m.modelo FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        marcaReservada: sql<string>`(SELECT m.marca FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`
    })
    .from(reservas)
    .where(eq(reservas.id, parseInt(params.id)))
    .limit(1);

    if (!reserva || reserva.length === 0) {
        throw error(404, 'Reserva no encontrada');
    }

    return {
        reserva
    };
};

export const actions: Actions = {
    cancelarReserva: async ({ request }) => {
        const formData = await request.formData();
        const reservaId = formData.get('reservaId');

        if (!reservaId) {
            return fail(400, {
                type: 'error',
                data: { error: 'ID de reserva no proporcionado' }
            });
        }

        try {
            await db.update(reservas)
                .set({
                    estado: 'Cancelada'
                })
                .where(eq(reservas.id, parseInt(reservaId.toString())));

            return {
                type: 'success'
            };
        } catch (err) {
            console.error('Error al cancelar la reserva:', err);
            return fail(500, {
                type: 'error',
                data: { error: 'Error al cancelar la reserva' }
            });
        }
    }
}; 