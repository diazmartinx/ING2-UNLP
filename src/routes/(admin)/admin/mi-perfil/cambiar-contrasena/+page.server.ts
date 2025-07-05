import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2'; // O usa 'argon2' si hay problemas de compatibilidad.

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'No autorizado');
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const newPasswordConfirm = formData.get('newPasswordConfirm') as string;

		if (!currentPassword || !newPassword || !newPasswordConfirm) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		if (newPassword !== newPasswordConfirm) {
			return fail(400, { error: 'Las contraseñas no coinciden' });
		}

		if (newPassword === currentPassword) {
			return fail(400, { error: 'La nueva contraseña no puede ser igual a la contraseña actual' });
		}

		if (newPassword.length < 6) {
			return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres' });
		}

		const user = await db.query.usuarios.findFirst({
			where: eq(usuarios.id, locals.user.id)
		});
		if (!user) {
			return fail(400, { error: 'Usuario no encontrado' });
		}

		const isCurrentPasswordValid = await verify(user.passwordHash, currentPassword);
		if (!isCurrentPasswordValid) {
			return fail(400, { error: 'La contraseña actual no es correcta' });
		}

		const newPasswordHash = await hash(newPassword);

		try {
			await db.update(usuarios).set({ passwordHash: newPasswordHash }).where(eq(usuarios.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Error al actualizar la contraseña' });
		}

		throw redirect(303, '/admin/mi-perfil?toast=contrasena');
	}
};