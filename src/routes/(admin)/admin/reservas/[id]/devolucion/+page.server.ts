import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { reservas, unidadesVehiculos, modelosVehiculos, usuarios } from '$lib/server/db/schema';
import { eq, sql, and, not, or, exists } from 'drizzle-orm';

type EstadoReserva = 'Pendiente' | 'Entregada' | 'Cancelada' | 'Devuelto';

export const load: PageServerLoad = async ({ params }) => {
    const reservaId = parseInt(params.id);
    
    if (isNaN(reservaId)) {
        throw error(400, 'ID de reserva inválido');
    }

    const reserva = await db.select({
        id: reservas.id,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        modeloReservado: sql<string>`(SELECT m.modelo FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        marcaReservada: sql<string>`(SELECT m.marca FROM modelos_vehiculos m WHERE m.id = ${reservas.idModeloReservado})`,
        idSucursal: reservas.idSucursal,
        idModeloReservado: reservas.idModeloReservado
    })
    .from(reservas)
    .leftJoin(modelosVehiculos, eq(reservas.idModeloReservado, modelosVehiculos.id))
    .where(eq(reservas.id, reservaId))
    .limit(1);

    if (!reserva) {
        throw error(404, 'Reserva no encontrada');
    }

    const unidadesDisponibles = await db.select({
        patente: unidadesVehiculos.patente,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo
    })
    .from(unidadesVehiculos)
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .where(
        and(
            eq(unidadesVehiculos.estado, 'Habilitado'),
            eq(unidadesVehiculos.idSucursal, reserva[0].idSucursal.toString()),
            eq(modelosVehiculos.id, reserva[0].idModeloReservado),
            not(
                exists(
                    db.select()
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente),
                            eq(reservas.estado, 'Entregada'),
                            or(
                                and(
                                    sql`datetime(${reservas.fechaInicio}, '-3 hours') <= datetime(${reserva[0].fechaFin}, '-3 hours')`,
                                    sql`datetime(${reservas.fechaFin}, '-3 hours') >= datetime(${reserva[0].fechaInicio}, '-3 hours')`
                                )
                            )
                        )
                    )
                )
            )
        )
    );

    return {
        reserva,
        unidades: unidadesDisponibles
    };
};

export const actions: Actions = {
    asignarUnidad: async ({ request }) => {
        const formData = await request.formData();
        const reservaId = parseInt(formData.get('reservaId') as string);
        const estado = formData.get('estado') as EstadoReserva;
        const patente = formData.get('patente') as string;

        if (!reservaId || !estado) {
            return {
                type: 'error',
                data: { error: 'Datos incompletos' }
            };
        }

        // Get current reservation state
        const [currentReserva] = await db.select({ estado: reservas.estado })
            .from(reservas)
            .where(eq(reservas.id, reservaId));

        if (!currentReserva) {
            return {
                type: 'error',
                data: { error: 'Reserva no encontrada' }
            };
        }

        if (estado === 'Cancelada' && currentReserva.estado === 'Entregada') {
            return {
                type: 'error',
                data: { error: 'No se puede cancelar una reserva que ya fue entregada' }
            };
        }

        if (estado === 'Entregada' && !patente) {
            return {
                type: 'error',
                data: { error: 'Debe seleccionar una unidad para asignar' }
            };
        }

        try {
            // Update the reservation with the new state and unit (if applicable)
            await db.update(reservas)
                .set({
                    patenteUnidadAsignada: estado === 'Entregada' ? patente : null,
                    estado: estado
                })
                .where(eq(reservas.id, reservaId));

            return {
                type: 'success'
            };
        } catch (err) {
            return {
                type: 'error',
                data: { error: 'Error al cambiar el estado de la reserva' }
            };
        }
    },
    confirmarDevolucion: async ({ request }) => {
        const formData = await request.formData();
        const reservaId = formData.get('reservaId');

        if (!reservaId) {
            return fail(400, {
                type: 'error',
                data: { error: 'ID de reserva no proporcionado' }
            });
        }

        try {
            // Get current reservation state
            const [currentReserva] = await db.select({ estado: reservas.estado })
                .from(reservas)
                .where(eq(reservas.id, parseInt(reservaId.toString())));

            if (!currentReserva) {
                return fail(404, {
                    type: 'error',
                    data: { error: 'Reserva no encontrada' }
                });
            }

            if (currentReserva.estado !== 'Entregada') {
                return fail(400, {
                    type: 'error',
                    data: { error: 'Solo se pueden devolver reservas que estén en estado Entregada' }
                });
            }

            // Update the reservation state to Devuelto
            await db.update(reservas)
                .set({
                    estado: 'Devuelto'
                })
                .where(eq(reservas.id, parseInt(reservaId.toString())));

            return {
                type: 'success'
            };
        } catch (err) {
            console.error('Error al confirmar la devolución:', err);
            return fail(500, {
                type: 'error',
                data: { error: 'Error al confirmar la devolución' }
            });
        }
    }
}; 