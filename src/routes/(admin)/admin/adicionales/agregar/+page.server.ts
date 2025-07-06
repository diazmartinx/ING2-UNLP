import { db } from '$lib/server/db';
import { eq, sql, and } from "drizzle-orm"
import { adicionales } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const nombre = String(data.get('nombre'));
        const precioPorDia = Number(data.get('precioPorDia'));

        // Validar que todos los campos estén presentes
        if (nombre === '' || !precioPorDia) {
            return fail(400, { error: 'Todos los campos son obligatorios' });
        }

        // Validar que el precio sea positivo
        if (precioPorDia <= 0) {
            return fail(400, { error: 'El precio por día debe ser mayor a 0' });
        }

        // Buscar si ya existe un adicional con ese nombre (case-insensitive)
        const existente = await db.select().from(adicionales).where(
            sql`lower(${adicionales.nombre}) = lower(${nombre})`
        );

        if (existente.length > 0) {
            if (existente[0].eliminado === 1) {
                // Si existe y está eliminado, reactivarlo y actualizar el precio
                await db.update(adicionales)
                    .set({ eliminado: 0, precioPorDia })
                    .where(eq(adicionales.id, existente[0].id));
                return { success: true };
            } else {
                // Si existe y NO está eliminado, error
                return fail(400, { error: 'El nombre ingresado ya existe' });
            }
        }

        // Si no existe, insertar normalmente
        await db.insert(adicionales).values({ 
            nombre, 
            precioPorDia 
        });

        return { success: true };
    }
};