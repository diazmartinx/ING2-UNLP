import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion, unidadesVehiculos, reservas } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async () => {
    const modelos = await db.select({
        id: modelosVehiculos.id,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenBlob: modelosVehiculos.imagenBlob,
        categoria: categoriasVehiculos.nombre,
        politicaCancelacion: politicasCancelacion.tipoPolitica,
        porcentajeReembolsoParcial: modelosVehiculos.porcentajeReembolsoParcial
    })
    .from(modelosVehiculos)
    .leftJoin(categoriasVehiculos, eq(modelosVehiculos.idCategoria, categoriasVehiculos.id))
    .leftJoin(politicasCancelacion, eq(modelosVehiculos.idPoliticaCancelacion, politicasCancelacion.id));

    // Obtener conteos para cada modelo
    const modelosConConteos = await Promise.all(
        modelos.map(async (modelo) => {
            
            // Contar todas las reservas (cualquier estado)
            const reservasActivasResult = await db.select({ count: count() })
                .from(reservas)
                .where(eq(reservas.idModeloReservado, modelo.id));

            // Contar unidades asignadas
            const unidadesAsignadasResult = await db.select({ count: count() })
                .from(unidadesVehiculos)
                .where(eq(unidadesVehiculos.idModelo, modelo.id));

            const reservasActivas = reservasActivasResult[0]?.count || 0;
            const unidadesAsignadas = unidadesAsignadasResult[0]?.count || 0;

            return {
                ...modelo,
                reservasActivas,
                unidadesAsignadas
            };
        })
    );

    // Convertir los blobs a base64 para la serialización
    const modelosSerializados = modelosConConteos.map(modelo => ({
        ...modelo,
        imagenBlob: modelo.imagenBlob instanceof Buffer ? modelo.imagenBlob.toString('base64') : null
    }));

    const categorias = await db.select().from(categoriasVehiculos);
    const politicas = await db.select().from(politicasCancelacion);

    return {
        modelos: modelosSerializados,
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
            const capacidadPasajeros = parseInt(formData.get('capacidadPasajeros') as string);
            const precioPorDia = parseFloat(formData.get('precioPorDia') as string);
            const idCategoria = parseInt(formData.get('idCategoria') as string);
            const idPoliticaCancelacion = parseInt(formData.get('idPoliticaCancelacion') as string);
            const porcentajeReembolsoParcialRaw = formData.get('porcentajeReembolsoParcial');
            let porcentajeReembolsoParcial: number | null = null;

            // Check for duplicate model
            const existingModel = await db.select()
                .from(modelosVehiculos)
                .where(
                    and(
                        eq(modelosVehiculos.marca, marca),
                        eq(modelosVehiculos.modelo, modelo)
                    )
                );

            if (existingModel.length > 0) {
                return fail(400, { message: 'Ya existe un modelo con la misma marca y modelo' });
            }

            // Buscar la política seleccionada
            const politicaSeleccionadaArr = await db.select().from(politicasCancelacion).where(eq(politicasCancelacion.id, idPoliticaCancelacion));
            const politicaSeleccionada = politicaSeleccionadaArr[0];
            if (politicaSeleccionada?.tipoPolitica === 'Reembolso Parcial') {
                porcentajeReembolsoParcial = porcentajeReembolsoParcialRaw ? parseFloat(porcentajeReembolsoParcialRaw as string) : null;
                if (porcentajeReembolsoParcial === null || isNaN(porcentajeReembolsoParcial) || porcentajeReembolsoParcial < 0 || porcentajeReembolsoParcial > 99) {
                    return fail(400, { message: 'Debe ingresar un porcentaje de reembolso parcial válido (0-99)' });
                }
            }

            if (!marca || !modelo || !capacidadPasajeros || !precioPorDia || !idCategoria || !idPoliticaCancelacion) {
                return fail(400, { message: 'Todos los campos son requeridos' });
            }

            // Manejar la imagen como binario
            const imagen = formData.get('imagen') as File;
            let imagenBlob: Buffer | null = null;

            if (imagen) {
                // Validar que el archivo sea una imagen
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
                if (!allowedTypes.includes(imagen.type)) {
                    return fail(400, { message: 'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP o AVIF)' });
                }

                try {
                    // Convertir la imagen a ArrayBuffer y luego a Buffer
                    const bytes = await imagen.arrayBuffer();
                    imagenBlob = Buffer.from(bytes);
                } catch (error) {
                    console.error('Error processing image:', error);
                    return fail(500, { message: 'Error al procesar la imagen' });
                }
            }

            try {
                await db.insert(modelosVehiculos).values({
                    marca,
                    modelo,
                    capacidadPasajeros,
                    precioPorDia,
                    imagenBlob,
                    idCategoria,
                    idPoliticaCancelacion,
                    porcentajeReembolsoParcial
                });
                return { success: true };
            } catch (error) {
                console.error('Error detallado:', error);
                if (error instanceof Error) {
                    return fail(500, { message: `Error al crear el modelo: ${error.message}` });
                }
                return fail(500, { message: 'Error al crear el modelo' });
            }
        } catch (error) {
            console.error('Error general:', error);
            if (error instanceof Error) {
                return fail(500, { message: `Error al procesar la solicitud: ${error.message}` });
            }
            return fail(500, { message: 'Error al procesar la solicitud' });
        }
    },

    
    eliminarModelo: async ({ request }) => {
    const formData = await request.formData();
    
    try {
        const id = parseInt(formData.get('id') as string);
        
        if (!id || isNaN(id)) {
            return fail(400, { message: 'ID del modelo no válido' });
        }

        // Verificar si el modelo existe
        const modeloExistente = await db.select()
            .from(modelosVehiculos)
            .where(eq(modelosVehiculos.id, id));

        if (modeloExistente.length === 0) {
            return fail(404, { message: 'El modelo no existe' });
        }

        //verificar si el modelo tiene reservas de cualquier tipo
        const reservasActivas = await db.select()
            .from(reservas)
            .where(eq(reservas.idModeloReservado, id));

        if (reservasActivas.length > 0) {
            return fail(400, { message: 'No se puede eliminar el modelo porque tiene reservas activas' });
        }

        // verificar vehículos asignados al modelo
        const vehiculosAsignados = await db.select()
            .from(unidadesVehiculos)
            .where(eq(unidadesVehiculos.idModelo, id));

        // eliminar vehiculos asignados al modelo
        if (vehiculosAsignados.length > 0) {
            await db.delete(unidadesVehiculos)
                .where(eq(unidadesVehiculos.idModelo, id));
        }

        // Eliminar el modelo
        await db.delete(modelosVehiculos)
            .where(eq(modelosVehiculos.id, id));

        return { success: true, message: 'Modelo eliminado exitosamente' };
        
    } catch (error) {
        console.error('Error al eliminar modelo:', error);
        if (error instanceof Error) {
            return fail(500, { message: `Error al eliminar el modelo: ${error.message}` });
        }
        return fail(500, { message: 'Error interno del servidor' });
    }
}

} satisfies Actions;