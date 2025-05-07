import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async () => {
    const modelos = await db.select({
        id: modelosVehiculos.id,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        anio: modelosVehiculos.anio,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenUrl: modelosVehiculos.imagenUrl,
        categoria: categoriasVehiculos.nombre,
        politicaCancelacion: politicasCancelacion.tipoPolitica
    })
    .from(modelosVehiculos)
    .leftJoin(categoriasVehiculos, eq(modelosVehiculos.idCategoria, categoriasVehiculos.id))
    .leftJoin(politicasCancelacion, eq(modelosVehiculos.idPoliticaCancelacion, politicasCancelacion.id));

    const categorias = await db.select().from(categoriasVehiculos);
    const politicas = await db.select().from(politicasCancelacion);

    return {
        modelos,
        categorias,
        politicas
    };
}) satisfies PageServerLoad;

export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        
        try {
            const marca = formData.get('marca') as string;
            const modelo = formData.get('modelo') as string;
            const anio = parseInt(formData.get('anio') as string);
            const capacidadPasajeros = parseInt(formData.get('capacidadPasajeros') as string);
            const precioPorDia = parseFloat(formData.get('precioPorDia') as string);
            const imagenUrl = formData.get('imagenUrl') as string;
            const idCategoria = parseInt(formData.get('idCategoria') as string);
            const idPoliticaCancelacion = parseInt(formData.get('idPoliticaCancelacion') as string);

            if (!marca || !modelo || !anio || !capacidadPasajeros || !precioPorDia || !imagenUrl || !idCategoria || !idPoliticaCancelacion) {
                return fail(400, { message: 'Todos los campos son requeridos' });
            }

            await db.insert(modelosVehiculos).values({
                marca,
                modelo,
                anio,
                capacidadPasajeros,
                precioPorDia,
                imagenUrl,
                idCategoria,
                idPoliticaCancelacion
            });

            throw redirect(303, '/admin/modelos');
        } catch (error) {
            console.error('Error creating model:', error);
            return fail(500, { message: 'Error al crear el modelo' });
        }
    }
} satisfies Actions;