import { db } from '$lib/server/db';
import { eq, sql } from "drizzle-orm"
import { categoriasVehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';


export const load = (async () => {

	const categorias = await db.select().from(categoriasVehiculos);

	return {categorias};
	
}) satisfies PageServerLoad;

export const actions = {
    create: async ({ cookies, request }) => {
        const data = await request.formData();
        const nombre = String(data.get('nombre'));

        // Validar que el nombre no esté vacío
		if (nombre === '') {
			return fail(400, { error: 'El nombre es obligatorio' });
		}

 		const [existingCategory] = await db
            .select()
            .from(categoriasVehiculos)
            .where(sql`lower(${categoriasVehiculos.nombre}) = ${nombre.toLowerCase()}`);

        if (existingCategory) {
            return fail(400, { error: 'La categoría ya existe' });
        }

        await db.insert(categoriasVehiculos).values({ nombre });

        return { success: true, message: 'Categoría creada exitosamente' };
    }
};