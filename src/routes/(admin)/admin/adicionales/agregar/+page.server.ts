import { db } from '$lib/server/db';
import { eq, sql } from "drizzle-orm"
import { adicionales } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
    create: async ({ cookies, request }) => {
        const data = await request.formData();
        const nombre = String(data.get('nombre'));
        const cantidadMaxima = Number(data.get('cantidadMaxima'));
        const precioPorDia = Number(data.get('precioPorDia'));

        // Validar que todos los campos estén presentes
		if (nombre === '' || !cantidadMaxima || !precioPorDia) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		// Validar que la cantidad máxima sea positiva
		if (cantidadMaxima <= 0) {
			return fail(400, { error: 'La cantidad máxima debe ser mayor a 0' });
		}

		// Validar que el precio sea positivo
		if (precioPorDia <= 0) {
			return fail(400, { error: 'El precio por día debe ser mayor a 0' });
		}

		// Validar que el nombre no exista en la base de datos (case-insensitive)
		const existeNombre = await db.select().from(adicionales).where(
			sql`lower(${adicionales.nombre}) = lower(${nombre})`
		);

		// Validar que el nombre no exista en la base de datos
		if (existeNombre.length > 0) {
			return fail(400, { error: 'El nombre ingresado ya existe' });
		}

        await db.insert(adicionales).values({ 
            nombre, 
            cantidadMaxima, 
            precioPorDia 
        });

        return { success: true, message: 'Adicional creado exitosamente' };
    }
};