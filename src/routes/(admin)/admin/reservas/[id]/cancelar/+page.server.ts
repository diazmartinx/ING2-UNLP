import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { reservas, modelosVehiculos, politicasCancelacion } from '$lib/server/db/schema';
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
            // 1. Obtener la reserva
            const reserva = await db.select().from(reservas)
                .where(eq(reservas.id, parseInt(reservaId.toString())))
                .limit(1);
            if (!reserva || reserva.length === 0) {
                return fail(404, {
                    type: 'error',
                    data: { error: 'Reserva no encontrada' }
                });
            }
            const reservaData = reserva[0];

            // 2. Obtener el modelo reservado
            const modelo = await db.select().from(modelosVehiculos)
                .where(eq(modelosVehiculos.id, reservaData.idModeloReservado))
                .limit(1);
            if (!modelo || modelo.length === 0) {
                return fail(404, {
                    type: 'error',
                    data: { error: 'Modelo no encontrado' }
                });
            }
            const modeloData = modelo[0];

            // 3. Obtener la política de cancelación
            const politica = await db.select().from(politicasCancelacion)
                .where(eq(politicasCancelacion.id, modeloData.idPoliticaCancelacion))
                .limit(1);
            if (!politica || politica.length === 0) {
                return fail(404, {
                    type: 'error',
                    data: { error: 'Política de cancelación no encontrada' }
                });
            }
            const politicaData = politica[0];

            // 4. Calcular el nuevo importe
            let nuevoImporte = reservaData.importeTotal;
            let nuevoImporteAdicionales = reservaData.importeAdicionales ?? 0;
            if (politicaData.tipoPolitica === 'Reembolso Total') {
                nuevoImporte = 0;
                nuevoImporteAdicionales = 0;
            } else if (politicaData.tipoPolitica === 'Reembolso Parcial' && modeloData.porcentajeReembolsoParcial != null) {
                nuevoImporte = reservaData.importeTotal * (1 - modeloData.porcentajeReembolsoParcial / 100);
                nuevoImporteAdicionales = (reservaData.importeAdicionales ?? 0) * (1 - modeloData.porcentajeReembolsoParcial / 100);
            }
            // Si es "Sin Reembolso", no se modifica el importe

            // 5. Actualizar reserva
            await db.update(reservas)
                .set({
                    estado: 'Cancelada',
                    importeTotal: nuevoImporte,
                    importeAdicionales: nuevoImporteAdicionales
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