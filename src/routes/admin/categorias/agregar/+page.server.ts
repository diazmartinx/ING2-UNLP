import { db } from '$lib/server/db';
import { eq } from "drizzle-orm"
import { categorias_vehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';


export const load = (async () => {

	const categorias = await db.select().from(categorias_vehiculos);

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

		// Validación para espacios en blanco
		if (nombre.includes(' ')) {
			return fail(400, { error: 'El nombre no debe contener espacios' });
		}

		const existeNombre = await db.select().from(categorias_vehiculos).where(eq(categorias_vehiculos.nombre, nombre));

		// Validar que el nombre no exista en la base de datos
		if (existeNombre.length > 0) {
			return fail(400, { error: 'El nombre ingresado ya existe' });
		}

        await db.insert(categorias_vehiculos).values({ nombre });

        return { success: true, message: 'Categoría creada exitosamente' };
    }
};