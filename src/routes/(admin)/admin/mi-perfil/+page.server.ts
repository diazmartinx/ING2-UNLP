import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'No autorizado');
	}

	const usuario = await db.query.usuarios.findFirst({
		where: eq(usuarios.id, locals.user.id)
	});

	if (!usuario) {
		throw error(404, 'Usuario no encontrado');
	}

	return {
		usuario,
		error: null,
		success: null
	};
};

export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'No autorizado');
		}

		const formData = await request.formData();
		const nombre = formData.get('nombre') as string;
		const apellido = formData.get('apellido') as string;
		const telefono = formData.get('telefono') as string;
		const fechaNacimiento = formData.get('fechaNacimiento') as string;

		try {
			await db
				.update(usuarios)
				.set({
					nombre,
					apellido,
					telefono,
					fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
				})
				.where(eq(usuarios.id, locals.user.id));

			return {
				usuario: await db.query.usuarios.findFirst({
					where: eq(usuarios.id, locals.user.id)
				}),
				success: 'Datos actualizados correctamente',
				error: null
			};
		} catch (e) {
			return {
				error: 'Error al actualizar los datos',
				success: null
			};
		}
	}
};