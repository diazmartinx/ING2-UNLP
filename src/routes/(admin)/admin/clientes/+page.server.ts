import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const clientesData = await db.select().from(usuarios).where(eq(usuarios.rol, 'cliente'));
	return {
		clientes: clientesData
	};
};

export const actions: Actions = {
	eliminar: async ({ request }) => {
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

            const eliminarCliente = await db.delete(usuarios).where(eq(usuarios.id, obtenerCliente[0].id));
			if (!eliminarCliente || eliminarCliente.rowsAffected === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}

            // Si se eliminó correctamente, retornar éxito
			return { success: true, message: 'Cliente eliminado exitosamente' };

		} catch (err) {
			return fail(500, { error: 'Error interno del servidor' });
		}
	}
};