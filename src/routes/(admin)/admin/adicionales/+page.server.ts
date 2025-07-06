import { db } from '$lib/server/db';
import { adicionales } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const toast = url.searchParams.get('toast') || '';
    const adicionalesData = await db
        .select()
        .from(adicionales)
        .where(eq(adicionales.eliminado, 0));
    return { 
        adicionales: adicionalesData,
        toast
    };
}) satisfies PageServerLoad;

export const actions = {
    eliminar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        await db.update(adicionales)
            .set({ eliminado: 1 })
            .where(eq(adicionales.id, id));
        const adicionalesData = await db
            .select()
            .from(adicionales)
            .where(eq(adicionales.eliminado, 0));
        return { success: true, adicionales: adicionalesData };
    },

    editar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const precioPorDia = Number(formData.get('precioPorDia'));

        if (!precioPorDia) {
            return fail(400, { error: 'Todos los campos son requeridos' });
        }

        await db.update(adicionales)
            .set({ precioPorDia })
            .where(eq(adicionales.id, id));
        const adicionalesData = await db
            .select()
            .from(adicionales)
            .where(eq(adicionales.eliminado, 0));
        return { success: true, adicionales: adicionalesData };
    }
} satisfies Actions;