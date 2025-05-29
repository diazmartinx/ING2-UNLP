import { db } from '$lib/server/db';
import { categoriasVehiculos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
    const categorias = await db.select().from(categoriasVehiculos)
    return { categorias };
}) satisfies PageServerLoad;

export const actions = {
    eliminar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        await db.delete(categoriasVehiculos).where(eq(categoriasVehiculos.id, id));
        const categorias = await db.select().from(categoriasVehiculos);
        return { success: true, categorias };
    },

    editar: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const nombre = formData.get('nombre')?.toString();

        if (!nombre) {
            return fail(400, { error: 'El nombre es requerido' });
        }

        // Verificar si ya existe una categoría con ese nombre
        const existente = await db
            .select()
            .from(categoriasVehiculos)
            .where(eq(categoriasVehiculos.nombre, nombre));

        if (existente.length > 0 && existente[0].id !== id) {
            return fail(400, { error: 'Ya existe una categoría con ese nombre' });
        }

        await db
            .update(categoriasVehiculos)
            .set({ nombre })
            .where(eq(categoriasVehiculos.id, id));
        
        const categorias = await db.select().from(categoriasVehiculos);
        return { success: true, categorias };
    }
} satisfies Actions;