import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const clienteDB = await db.select().from(usuarios).where(eq(usuarios.id, Number(params.id)));
    console.log('Cliente encontrado:', clienteDB);
	return {
		cliente: clienteDB[0]
	};
};

export const actions: Actions = {
	guardar: async ({ request, params }) => {
		const data = await request.formData();
		const nombre = data.get('nombre')?.toString() ?? '';
		const apellido = data.get('apellido')?.toString() ?? '';
		const dni = data.get('dni')?.toString() ?? '';
		const email = data.get('email')?.toString() ?? '';
		const telefono = data.get('telefono')?.toString() ?? '';
        
        if (!nombre || !apellido || !dni || !email || !telefono) {
            return fail(400, { error: 'Todos los campos son obligatorios' });
        }

		const id = Number(params.id);


		try {
			const updated = await db
				.update(usuarios)
				.set({ nombre, apellido, dni, email, telefono })
				.where(eq(usuarios.id, id));

			if (updated.rowsAffected === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}
			return { success: true, message: 'Cliente actualizado exitosamente' };
		} catch (err) {
			return fail(500, { error: 'Error interno al actualizar el cliente' });
		}
	}
};