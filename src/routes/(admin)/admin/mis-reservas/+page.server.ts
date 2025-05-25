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

    const reservasUsuario = await db
        .select({
            id: reservas.id,
            patenteReserva: reservas.patenteUnidadReservada,
            patenteAsignada: reservas.patenteUnidadAsignada,
            fechaInicio: reservas.fechaInicio,
            fechaFin: reservas.fechaFin,
            estado: reservas.estado,
            importeTotal: reservas.importeTotal,
            marca: modelosVehiculos.marca,
            modelo: modelosVehiculos.modelo, 
            tipoPolitica: politicasCancelacion.tipoPolitica,
            porcentajeReembolsoParcial: modelosVehiculos.porcentajeReembolsoParcial,
            nombreSucursal: sucursales.nombre,
            direccionSucursal: sucursales.direccion
        })
        .from(reservas)
        .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadReservada, unidadesVehiculos.patente))
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .leftJoin(politicasCancelacion, eq(modelosVehiculos.idPoliticaCancelacion, politicasCancelacion.id))
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .where(eq(reservas.idUsuario, session.userId))
        .orderBy(
            desc(sql`${reservas.estado} = 'Pendiente'`),
            (reservas.fechaInicio)
            
        );

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