import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion, unidadesVehiculos, reservas } from '$lib/server/db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { Buffer } from 'buffer';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params }) => {
    const modeloIdString = params.id;
    if (!modeloIdString) {
        throw error(400, 'ID de modelo no proporcionado.');
    }

    const modeloId = parseInt(modeloIdString, 10);
    if (isNaN(modeloId)) {
        throw error(400, 'ID de modelo inválido. Debe ser un número.');
    }

    const result = await db
        .select()
        .from(modelosVehiculos)
        .where(eq(modelosVehiculos.id, modeloId))
        .leftJoin(categoriasVehiculos, eq(modelosVehiculos.idCategoria, categoriasVehiculos.id))
        .leftJoin(politicasCancelacion, eq(modelosVehiculos.idPoliticaCancelacion, politicasCancelacion.id))
        .get();

    if (!result || !result.modelos_vehiculos) {
        throw error(404, `Modelo con ID ${modeloId} no encontrado.`);
    }

    // Verificar si se puede editar marca y modelo
    const vehiculosAsignados = await db.select({ patente: unidadesVehiculos.patente })
        .from(unidadesVehiculos)
        .where(eq(unidadesVehiculos.idModelo, modeloId));

    let puedeEditarMarcaModelo = true;
    if (vehiculosAsignados.length > 0) {
        // Si tiene vehículos, verificar si alguno tiene reservas de cualquier tipo
        const patentes = vehiculosAsignados.map(v => v.patente);
        const reservasExistentes = await db.select({ id: reservas.id })
            .from(reservas)
            .where(inArray(reservas.patenteUnidadAsignada, patentes))
            .limit(1);

        puedeEditarMarcaModelo = reservasExistentes.length === 0;
    }

    // Obtener todas las categorías disponibles
    const todasLasCategorias = await db
        .select()
        .from(categoriasVehiculos)
        .all();

    // Obtener todas las políticas disponibles
    const todasLasPoliticas = await db
        .select()
        .from(politicasCancelacion)
        .all();

    let imagenBase64 = null;
    if (result.modelos_vehiculos.imagenBlob) {
        let bufferToConvert: Buffer;
        if (Buffer.isBuffer(result.modelos_vehiculos.imagenBlob)) {
            bufferToConvert = result.modelos_vehiculos.imagenBlob;
        } else if (result.modelos_vehiculos.imagenBlob instanceof Uint8Array) {
            bufferToConvert = Buffer.from(result.modelos_vehiculos.imagenBlob);
        } else {
            console.warn('imagenBlob no es Buffer ni Uint8Array:', typeof result.modelos_vehiculos.imagenBlob);
            bufferToConvert = Buffer.from([]); // Default to empty buffer
        }
        
        if (bufferToConvert.length > 0) {
            // Assuming JPEG for simplicity. Ideally, MIME type should be stored or inferred.
            imagenBase64 = `data:image/jpeg;base64,${bufferToConvert.toString('base64')}`;
        }
    }

    const modeloData = {
        ...result.modelos_vehiculos,
        imagenBlob: undefined, // Remove raw blob from being sent to client
        imagenUrl: imagenBase64
    };
    
    return {
        modelo: modeloData,
        categoria: result.categorias_vehiculos, // This can be null
        politica: result.politicas_cancelacion, // This should ideally not be null based on schema, but leftJoin handles it
        categorias: todasLasCategorias,
        politicas: todasLasPoliticas,
        puedeEditarMarcaModelo
    };
}) satisfies PageServerLoad;

export const actions = {
    edit: async ({ request, params }) => {
        const formData = await request.formData();
        
        try {
            const id = parseInt(params.id as string);
            const marca = formData.get('marca') as string;
            const modelo = formData.get('modelo') as string;
            const capacidadPasajeros = parseInt(formData.get('capacidadPasajeros') as string);
            const precioPorDia = parseFloat(formData.get('precioPorDia') as string);
            const idCategoria = parseInt(formData.get('idCategoria') as string);

            if (!id || isNaN(id)) {
                return fail(400, { message: 'ID del modelo no válido' });
            }

            // Verificar si el modelo existe
            const modeloExistente = await db.select({ id: modelosVehiculos.id })
                .from(modelosVehiculos)
                .where(eq(modelosVehiculos.id, id))
                .get();

            if (!modeloExistente) {
                return fail(404, { message: 'El modelo no existe' });
            }

            // Obtener el modelo actual para comparar si marca y modelo cambiaron
            const modeloActual = await db.select()
                .from(modelosVehiculos)
                .where(eq(modelosVehiculos.id, id))
                .get();

            if (!modeloActual) {
                return fail(404, { message: 'El modelo no existe' });
            }

            // Verificar si marca o modelo han cambiado
            const marcaCambio = modeloActual.marca !== marca;
            const modeloCambio = modeloActual.modelo !== modelo;

            if (marcaCambio || modeloCambio) {
                // Verificar si el modelo tiene vehículos asignados
                const vehiculosAsignados = await db.select({ patente: unidadesVehiculos.patente })
                    .from(unidadesVehiculos)
                    .where(eq(unidadesVehiculos.idModelo, id));

                if (vehiculosAsignados.length > 0) {
                    // Si tiene vehículos, verificar si alguno tiene reservas de cualquier tipo
                    const patentes = vehiculosAsignados.map(v => v.patente);
                    const reservasExistentes = await db.select({ id: reservas.id })
                        .from(reservas)
                        .where(inArray(reservas.patenteUnidadAsignada, patentes))
                        .limit(1);

                    if (reservasExistentes.length > 0) {
                        return fail(400, { 
                            message: 'No se pueden modificar la marca y/o modelo porque existen vehículos con reservas asociadas' 
                        });
                    }
                }
            }

            // Check for duplicate model (excluding current model)
            const existingModel = await db.select()
                .from(modelosVehiculos)
                .where(
                    and(
                        eq(modelosVehiculos.marca, marca),
                        eq(modelosVehiculos.modelo, modelo)
                    )
                );

            if (existingModel.length > 0 && existingModel[0].id !== id) {
                return fail(400, { message: 'Ya existe otro modelo con la misma marca y modelo' });
            }

            if (!marca || !modelo || !capacidadPasajeros || !precioPorDia || !idCategoria) {
                return fail(400, { message: 'Todos los campos son requeridos' });
            }

            // Preparar los datos para actualizar (sin incluir idPoliticaCancelacion)
            const updateData: any = {
                marca,
                modelo,
                capacidadPasajeros,
                precioPorDia,
                idCategoria
            };

            // Manejar la imagen si se proporciona una nueva
            const imagen = formData.get('imagen') as File;
            if (imagen && imagen.size > 0) {
                // Validar que el archivo sea una imagen
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
                if (!allowedTypes.includes(imagen.type)) {
                    return fail(400, { message: 'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP o AVIF)' });
                }

                try {
                    // Convertir la imagen a ArrayBuffer y luego a Buffer
                    const bytes = await imagen.arrayBuffer();
                    updateData.imagenBlob = Buffer.from(bytes);
                } catch (error) {
                    console.error('Error processing image:', error);
                    return fail(500, { message: 'Error al procesar la imagen' });
                }
            }

            try {
                await db.update(modelosVehiculos)
                    .set(updateData)
                    .where(eq(modelosVehiculos.id, id));
                    
                return { success: true };
            } catch (error) {
                console.error('Error detallado:', error);
                if (error instanceof Error) {
                    return fail(500, { message: `Error al editar el modelo: ${error.message}` });
                }
                return fail(500, { message: 'Error al editar el modelo' });
            }
        } catch (error) {
            console.error('Error general:', error);
            if (error instanceof Error) {
                return fail(500, { message: `Error al procesar la solicitud: ${error.message}` });
            }
            return fail(500, { message: 'Error al procesar la solicitud' });
        }
    }
} satisfies Actions;
