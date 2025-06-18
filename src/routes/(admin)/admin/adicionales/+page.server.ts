import { db } from '$lib/server/db';
import { adicionales } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
    const adicionalesData = await db.select().from(adicionales)
    return { adicionales: adicionalesData };
}) satisfies PageServerLoad;

export const actions = {
    eliminar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        await db.delete(adicionales).where(eq(adicionales.id, id));
        const adicionalesData = await db.select().from(adicionales);
        return { success: true, adicionales: adicionalesData };
    },

    editar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const nombre = formData.get('nombre')?.toString();
        const cantidadMaxima = Number(formData.get('cantidadMaxima'));
        const precioPorDia = Number(formData.get('precioPorDia'));

        if (!nombre || !cantidadMaxima || !precioPorDia) {
            return fail(400, { error: 'Todos los campos son requeridos' });
        }

        // Verificar si ya existe un adicional con ese nombre
        const existente = await db
            .select()
            .from(adicionales)
            .where(eq(adicionales.nombre, nombre));

        if (existente.length > 0 && existente[0].id !== id) {
            return fail(400, { error: 'Ya existe un adicional con ese nombre' });
        }

        await db
            .update(adicionales)
            .set({ nombre, cantidadMaxima, precioPorDia })
            .where(eq(adicionales.id, id));
        
        const adicionalesData = await db.select().from(adicionales);
        return { success: true, adicionales: adicionalesData };
    }
} satisfies Actions;