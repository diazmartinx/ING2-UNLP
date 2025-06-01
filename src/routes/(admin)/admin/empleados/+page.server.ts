import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq, and, or, like } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const busqueda = url.searchParams.get('buscar') || '';
	
	let empleadoData;
	
	if (busqueda.trim()) {
		// Realizar búsqueda en múltiples campos
		const termino = `%${busqueda.trim()}%`;
		empleadoData = await db.select().from(usuarios).where(and(eq(usuarios.rol, 'empleado'),
					or(
						like(usuarios.dni, termino),
						like(usuarios.apellido, termino),
						like(usuarios.nombre, termino),
						like(usuarios.email, termino)
					)
				)
			);
	} else {
		// Obtener todos los empleado si no hay búsqueda
		empleadoData = await db.select().from(usuarios).where(or(eq(usuarios.rol, 'empleado'), eq(usuarios.rol, 'admin')));
	}
	
	return {
		empleado: empleadoData,
		busqueda
	};
};

export const actions: Actions = {
	eliminar: async ({ request }) => {
		const data = await request.formData();
		const empleadoId = data.get('empleadoId');

		if (!empleadoId || typeof empleadoId !== 'string') {
			return fail(400, { error: 'ID de empleado inválido' });
		}

		try {
			// Verificar si el empleado existe y es un empleado
			const obtenerEmpleado = await db.select().from(usuarios).where(eq(usuarios.id, parseInt(empleadoId)));

			if (obtenerEmpleado.length === 0) {
				return fail(404, { error: 'Empleado no encontrado' });
			}

			const eliminarEmpleado = await db.delete(usuarios).where(eq(usuarios.id, obtenerEmpleado[0].id));
			if (!eliminarEmpleado || eliminarEmpleado.rowsAffected === 0) {
				return fail(404, { error: 'Empleado no encontrado' });
			}

			// Si se eliminó correctamente, retornar éxito
			return { success: true, message: 'Empleado eliminado exitosamente' };

		} catch (err) {
			return fail(500, { error: 'Error interno del servidor' });
		}
	}
};