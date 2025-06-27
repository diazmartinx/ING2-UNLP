import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq, and, or, like } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const busqueda = url.searchParams.get('buscar') || '';
	
	let clientesData;
	
	if (busqueda.trim()) {
		// Realizar búsqueda en múltiples campos
		const termino = `%${busqueda.trim()}%`;
		clientesData = await db.select().from(usuarios).where(and(eq(usuarios.rol, 'cliente'),
					or(
						like(usuarios.dni, termino),
						like(usuarios.apellido, termino),
						like(usuarios.nombre, termino),
						like(usuarios.email, termino)
					)
				)
			);
	} else {
		// Obtener todos los clientes si no hay búsqueda
		clientesData = await db.select().from(usuarios).where(eq(usuarios.rol, 'cliente'));
	}
	
	return {
		clientes: clientesData,
		busqueda
	};
};

export const actions: Actions = {
	darDeBaja: async ({ request }) => {
		const data = await request.formData();
		const clienteId = data.get('clienteId');

		if (!clienteId || typeof clienteId !== 'string') {
			return fail(400, { error: 'ID de cliente inválido' });
		}

		try {
			// Verificar si el cliente existe y es un cliente
			const obtenerCliente = await db.select().from(usuarios).where(eq(usuarios.id, parseInt(clienteId)));

			if (obtenerCliente.length === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}

			await db.update(usuarios).set({ estado: 'inactivo' }).where(eq(usuarios.id, obtenerCliente[0].id));

			// Si se eliminó correctamente, retornar éxito
			return { success: true, message: 'Cliente dado de baja exitosamente' };

		} catch (err) {
			return fail(500, { error: 'Error interno del servidor' });
		}
	},
	darDeAlta: async ({ request }) => {
		const data = await request.formData();
		const clienteId = data.get('clienteId');

		if (!clienteId || typeof clienteId !== 'string') {
			return fail(400, { error: 'ID de cliente inválido' });
		}

		try {
			// Verificar si el cliente existe y es un cliente
			const obtenerCliente = await db.select().from(usuarios).where(eq(usuarios.id, parseInt(clienteId)));

			if (obtenerCliente.length === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}

			await db.update(usuarios).set({ estado: 'activo' }).where(eq(usuarios.id, obtenerCliente[0].id));

			// Si se eliminó correctamente, retornar éxito
			return { success: true, message: 'Cliente dado de alta exitosamente' };

		} catch (err) {
			return fail(500, { error: 'Error interno del servidor' });
		}
	}
};