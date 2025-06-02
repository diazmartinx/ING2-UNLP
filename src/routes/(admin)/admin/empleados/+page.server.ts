import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq, and, or, like } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const busqueda = url.searchParams.get('buscar') || '';
	
	let empleadoData;
	
	if (busqueda.trim()) {
		const termino = `%${busqueda.trim()}%`;
		
		const condicionesBusqueda = [
			like(usuarios.dni, termino),
			like(usuarios.apellido, termino),
			like(usuarios.nombre, termino),
			like(usuarios.email, termino),
			like(usuarios.rol, termino)
		];
		
		
		empleadoData = await db.select().from(usuarios).where(
			and(or(eq(usuarios.rol, 'empleado'),eq(usuarios.rol, 'admin')),or(...condicionesBusqueda))
		);
	} else {
		empleadoData = await db.select().from(usuarios).where(
			or(eq(usuarios.rol, 'empleado'), eq(usuarios.rol, 'admin'))
		);
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

		const id = parseInt(empleadoId);
		if (isNaN(id)) {
			return fail(400, { error: 'ID de empleado inválido' });
		}

		try {
			const obtenerEmpleado = await db.select().from(usuarios).where(eq(usuarios.id, id));

			if (obtenerEmpleado.length === 0) {
				return fail(404, { error: 'Empleado no encontrado' });
			}

			if (obtenerEmpleado[0].rol === 'admin') {
				return fail(400, { error: 'No se puede eliminar un administrador' });
			}

			const eliminarEmpleado = await db.delete(usuarios).where(eq(usuarios.id, id));
			
			if (!eliminarEmpleado || eliminarEmpleado.rowsAffected === 0) {
				return fail(404, { error: 'Empleado no encontrado' });
			}

			return { success: true, message: 'Empleado eliminado exitosamente' };

		} catch (err) {
			console.error('Error al eliminar empleado:', err);
			return fail(500, { error: 'Error interno del servidor' });
		}
	}
};