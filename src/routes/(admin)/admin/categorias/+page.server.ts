import { db } from '$lib/server/db';
import { categoriasVehiculos, modelosVehiculos, reservas, unidadesVehiculos } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
    const categorias = await db.select().from(categoriasVehiculos)
    return { categorias };
}) satisfies PageServerLoad;

export const actions = {
	eliminar: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		const modelosEnCategoria = await db
			.select({ id: modelosVehiculos.id })
			.from(modelosVehiculos)
			.where(eq(modelosVehiculos.idCategoria, id));

		if (modelosEnCategoria.length > 0) {
			const modeloIds = modelosEnCategoria.map((m) => m.id);

			const reservasExistentes = await db
				.select({ id: reservas.id })
				.from(reservas)
				.where(inArray(reservas.idModeloReservado, modeloIds))
				.limit(1);

			if (reservasExistentes.length > 0) {
				return fail(400, {
					error: 'No se puede eliminar la categoría porque tiene modelos con reservas asociadas.'
				});
			}

			// Si no hay reservas, eliminar primero las unidades de vehículos asociadas a los modelos
			await db.delete(unidadesVehiculos).where(inArray(unidadesVehiculos.idModelo, modeloIds));
			
			// Luego eliminar los modelos asociados
			await db.delete(modelosVehiculos).where(inArray(modelosVehiculos.id, modeloIds));
		}

		await db.delete(categoriasVehiculos).where(eq(categoriasVehiculos.id, id));
		const categorias = await db.select().from(categoriasVehiculos);
		return { success: true, categorias, message: 'Categoría, modelos y vehículos asociados eliminados exitosamente' };
	}
} satisfies Actions;