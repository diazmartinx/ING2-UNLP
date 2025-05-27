import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { reservas, unidadesVehiculos, usuarios } from '$lib/server/db/schema';
import { eq, desc, like, sql, and } from 'drizzle-orm';
import { error, type Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const load = (async ({ url }) => {
    const searchParams = url.searchParams;
    const dniCliente = searchParams.get('dni') || '';
    const estado = searchParams.get('estado') || '';

    const conditions = [];

    if (dniCliente) {
        conditions.push(like(usuarios.dni, `%${dniCliente}%`));
    }

    if (estado) {
        conditions.push(eq(reservas.estado, estado as 'Pendiente' | 'Entregada' | 'Cancelada'));
    }

    const baseQuery = db.select({
        id: reservas.id,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        estado: reservas.estado,
        dniCliente: usuarios.dni,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        nombreCliente: usuarios.nombre,
        apellidoCliente: usuarios.apellido,
        modeloReservado: sql<string>`(SELECT modelo FROM modelos_vehiculos WHERE id = ${reservas.idModeloReservado})`
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .orderBy(desc(reservas.fechaInicio));

    const finalQuery = conditions.length > 0 
        ? baseQuery.where(and(...conditions))
        : baseQuery;

    const reservasList = await finalQuery;

    return {
        reservas: reservasList
    };
}) satisfies PageServerLoad;

export const actions = {
    actualizarEstado: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        const nuevoEstado = formData.get('nuevoEstado');

        if (!id || !nuevoEstado) {
            return fail(400, { error: 'Faltan datos requeridos' });
        }

        try {
            await db.update(reservas)
                .set({ estado: nuevoEstado as 'Pendiente' | 'Entregada' | 'Cancelada' })
                .where(eq(reservas.id, Number(id)));

            return { type: 'success' };
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            return fail(500, { error: 'Error al actualizar el estado de la reserva' });
        }
    }
} satisfies Actions;
