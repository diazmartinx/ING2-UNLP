import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';

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

export const actions: Actions = {
	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'No autorizado');
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const newPasswordConfirm = formData.get('newPasswordConfirm') as string;

		if (newPassword !== newPasswordConfirm) {
			return fail(400, { error: 'Las contraseñas no coinciden' });
		}

		// new password and current password cannot be the same
		if (newPassword === currentPassword) {
			return fail(400, { error: 'La nueva contraseña no puede ser igual a la contraseña actual' });
		}
		
		// at least 6 characters
		if (newPassword.length < 6) {
			return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres' });
		}

		// check if current password is correct
		const user = await db.query.usuarios.findFirst({
			where: eq(usuarios.id, locals.user.id)
		});
		if (!user) {
			return fail(400, { error: 'Usuario no encontrado' });
		}
		
		// Verify current password using argon2 verify function
		const isCurrentPasswordValid = await verify(user.passwordHash, currentPassword);
		if (!isCurrentPasswordValid) {
			return fail(400, { error: 'La contraseña actual no es correcta' });
		}

		const newPasswordHash = await hash(newPassword);

		try {
			await db.update(usuarios).set({ passwordHash: newPasswordHash }).where(eq(usuarios.id, locals.user.id));
		} catch (e) {
			return fail(500, { error: 'Error al actualizar la contraseña' });
		}

		return {
			success: 'Contraseña actualizada correctamente',
			error: null
		};
	},
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
			return fail(500, {
				error: 'Error al actualizar los datos',
				success: null
			});
		}
	}
}; 