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
        modeloReservado: modelosVehiculos.modelo,
        marcaReservada: modelosVehiculos.marca,
        tipoPolitica: politicasCancelacion.tipoPolitica,
        porcentajeReembolsoParcial: modelosVehiculos.porcentajeReembolsoParcial, 
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .leftJoin(modelosVehiculos, eq(reservas.idModeloReservado, modelosVehiculos.id))
    .leftJoin(politicasCancelacion, eq(modelosVehiculos.idPoliticaCancelacion, politicasCancelacion.id))
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
            // 1. Obtener la reserva
            const reserva = await db.select().from(reservas)
                .where(eq(reservas.id, idReserva))
                .limit(1);
            if (!reserva || reserva.length === 0) {
                return { success: false, error: 'Reserva no encontrada' };
            }
            const reservaData = reserva[0];

            // 2. Obtener el modelo reservado
            const modelo = await db.select().from(modelosVehiculos)
                .where(eq(modelosVehiculos.id, reservaData.idModeloReservado))
                .limit(1);
            if (!modelo || modelo.length === 0) {
                return { success: false, error: 'Modelo no encontrado' };
            }
            const modeloData = modelo[0];

            // 3. Obtener la política de cancelación
            const politica = await db.select().from(politicasCancelacion)
                .where(eq(politicasCancelacion.id, modeloData.idPoliticaCancelacion))
                .limit(1);
            if (!politica || politica.length === 0) {
                return { success: false, error: 'Política de cancelación no encontrada' };
            }
            const politicaData = politica[0];

            // 4. Calcular el nuevo importe
            let nuevoImporte = reservaData.importeTotal;
            if (politicaData.tipoPolitica === 'Reembolso Total') {
                nuevoImporte = 0;
            } else if (politicaData.tipoPolitica === 'Reembolso Parcial' && modeloData.porcentajeReembolsoParcial != null) {
                nuevoImporte = reservaData.importeTotal * (1 - modeloData.porcentajeReembolsoParcial / 100);
            }
            // Si es "Sin Reembolso", no se modifica el importe

            // 5. Actualizar reserva
            await db.update(reservas)
                .set({ estado: 'Cancelada', importeTotal: nuevoImporte })
                .where(eq(reservas.id, idReserva));
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            return { success: false, error: (error as any).message };
        }

        return { success: true };
    }
};