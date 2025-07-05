import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { reservas, unidadesVehiculos, modelosVehiculos, adicionales, reservasAdicionales } from '$lib/server/db/schema';
import { eq, sql, and, not, exists, lte, gte, inArray } from 'drizzle-orm';

type EstadoReserva = 'Pendiente' | 'Entregada' | 'Cancelada';

// Helper function para verificar disponibilidad de unidades
const getDisponibilidadCondition = (fechaInicio: Date, fechaFin: Date) => {
    return not(
        exists(
            db.select()
            .from(reservas)
            .where(
                and(
                    eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente),
                    eq(reservas.estado, 'Entregada'),
                    and(
                        lte(reservas.fechaInicio, fechaFin),
                        gte(reservas.fechaFin, fechaInicio)
                    )
                )
            )
        )
    );
};

export const load: PageServerLoad = async ({ params }) => {
    const reservaId = parseInt(params.id);
    
    if (isNaN(reservaId)) {
        throw error(400, 'ID de reserva inválido');
    }

    // Obtener reserva con datos del modelo en una sola query
    const reserva = await db.select({
        id: reservas.id,
        estado: reservas.estado,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        modeloReservado: modelosVehiculos.modelo,
        marcaReservada: modelosVehiculos.marca,
        precioPorDiaReservado: modelosVehiculos.precioPorDia,
        idSucursal: reservas.idSucursal,
        idModeloReservado: reservas.idModeloReservado
    })
    .from(reservas)
    .innerJoin(modelosVehiculos, eq(reservas.idModeloReservado, modelosVehiculos.id))
    .where(eq(reservas.id, reservaId))
    .limit(1);

    if (!reserva || reserva.length === 0) {
        throw error(404, 'Reserva no encontrada');
    }

    const reservaData = reserva[0];
    const disponibilidadCondition = getDisponibilidadCondition(reservaData.fechaInicio, reservaData.fechaFin);

    // Ejecutar ambas queries en paralelo
    const [unidadesModeloReservado, unidadesOtrosModelos, adicionalesDisponibles] = await Promise.all([
        // Unidades del modelo reservado
        db.select({
            patente: unidadesVehiculos.patente,
            marca: modelosVehiculos.marca,
            modelo: modelosVehiculos.modelo,
            precioPorDia: modelosVehiculos.precioPorDia
        })
        .from(unidadesVehiculos)
        .innerJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .where(
            and(
                eq(unidadesVehiculos.estado, 'Habilitado'),
                eq(unidadesVehiculos.idSucursal, reservaData.idSucursal.toString()),
                eq(modelosVehiculos.id, reservaData.idModeloReservado),
                disponibilidadCondition
            )
        ),

        // Unidades de otros modelos de igual o mayor valor
        db.select({
            patente: unidadesVehiculos.patente,
            marca: modelosVehiculos.marca,
            modelo: modelosVehiculos.modelo,
            precioPorDia: modelosVehiculos.precioPorDia
        })
        .from(unidadesVehiculos)
        .innerJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .where(
            and(
                eq(unidadesVehiculos.estado, 'Habilitado'),
                eq(unidadesVehiculos.idSucursal, reservaData.idSucursal.toString()),
                gte(modelosVehiculos.precioPorDia, reservaData.precioPorDiaReservado),
                not(eq(modelosVehiculos.id, reservaData.idModeloReservado)),
                disponibilidadCondition
            )
        ),

        // Adicionales disponibles
        db.select().from(adicionales)
    ]);

    return {
        reserva,
        unidadesModeloReservado,
        unidadesOtrosModelos,
        adicionalesDisponibles
    };
};

export const actions: Actions = {
    asignarUnidad: async ({ request }) => {
        const formData = await request.formData();
        const reservaId = parseInt(formData.get('reservaId') as string);
        const estado = formData.get('estado') as EstadoReserva;
        const patente = formData.get('patente') as string;
        const adicionalesRaw = formData.get('adicionales') as string | null;
        // adicionales: formato "1:2,3:1" (id:cantidad)
        let adicionalesParsed: { id: number, cantidad: number }[] = [];
        if (adicionalesRaw) {
            // Ahora solo ids separados por coma, ejemplo: "1,3"
            adicionalesParsed = adicionalesRaw.split(',').filter(Boolean).map(idStr => ({
                id: Number(idStr),
                cantidad: 1
            }));
        }

        if (!reservaId || !estado) {
            return {
                type: 'error',
                data: { error: 'Datos incompletos' }
            };
        }

        // Verificar estado actual de la reserva
        const [currentReserva] = await db.select({ estado: reservas.estado })
            .from(reservas)
            .where(eq(reservas.id, reservaId));

        if (!currentReserva) {
            return {
                type: 'error',
                data: { error: 'Reserva no encontrada' }
            };
        }

        // Validaciones de estado
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
            // Obtener datos de la reserva para calcular días
            const [reservaRow] = await db.select({
                fechaInicio: reservas.fechaInicio,
                fechaFin: reservas.fechaFin
            }).from(reservas).where(eq(reservas.id, reservaId));

            let importeAdicionales = 0;
            if (adicionalesParsed.length > 0) {
                console.log('Adicionales seleccionados:', adicionalesParsed);
                // Traer precios de los adicionales seleccionados
                const adicionalesIds = adicionalesParsed.map(a => a.id);
                const adicionalesPrecios = await db.select({
                    id: adicionales.id,
                    precioPorDia: adicionales.precioPorDia
                }).from(adicionales).where(inArray(adicionales.id, adicionalesIds));

                // Calcular cantidad de días (inclusive)
                const fechaInicio = new Date(reservaRow.fechaInicio);
                const fechaFin = new Date(reservaRow.fechaFin);
                const diffMs = fechaFin.getTime() - fechaInicio.getTime();
                const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

                // Calcular el importe total de adicionales
                for (const adicional of adicionalesParsed) {
                    const precio = adicionalesPrecios.find(a => a.id === adicional.id)?.precioPorDia ?? 0;
                    importeAdicionales += precio * adicional.cantidad * dias; // adicional.cantidad siempre es 1
                }
            }
            console.log('Importe adicionales calculado:', importeAdicionales);
            await db.update(reservas)
                .set({
                    patenteUnidadAsignada: estado === 'Entregada' ? patente : null,
                    estado: estado,
                    importeAdicionales: importeAdicionales
                })
                .where(eq(reservas.id, reservaId));

            // Guardar adicionales
            if (adicionalesParsed.length > 0) {
                const inserts = adicionalesParsed.map(a => ({
                    idReserva: reservaId,
                    idAdicional: a.id
                }));
                await db.insert(reservasAdicionales).values(inserts);
            }

            return {
                success: true,
                redirect: '/admin/reservas?toast=unidad-asignada'
            };
        } catch (err) {
            if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
                // Es un redirect, relanzar
                throw err;
            }
            console.error('Error al actualizar reserva:', err);
            return {
                type: 'error',
                data: { error: 'Error al cambiar el estado de la reserva' }
            };
        }
    }
};