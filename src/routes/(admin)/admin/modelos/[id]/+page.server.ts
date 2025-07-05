import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit'; // Added fail
import { Buffer } from 'buffer'; // Import Buffer

export async function load({ params }) {
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

    // Obtener todas las categorías disponibles
    const todasLasCategorias = await db
        .select()
        .from(categoriasVehiculos)
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
        categorias: todasLasCategorias
    };
}

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        // Extraer todos los campos del formulario
        const fields = {
            id: formData.get('id'),
            marca: formData.get('marca'),
            modeloNombre: formData.get('modeloNombre'),
            capacidadPasajeros: formData.get('capacidadPasajeros'),
            precioPorDia: formData.get('precioPorDia'),
            tipoPolitica: formData.get('tipoPolitica'),
            porcentajeReembolsoParcial: formData.get('porcentajeReembolsoParcial'),
            categoriaId: formData.get('categoriaId'),
            imagen: formData.get('imagen') as File
        };

        const errors: Record<string, string> = {};
        
        // Validar ID del modelo
        let modeloId: number;
        if (!fields.id || typeof fields.id.toString() !== 'string') {
            return fail(500, { message: 'ID del modelo es inválido o no proporcionado.'});
        }
        modeloId = parseInt(fields.id.toString(), 10);
        if (isNaN(modeloId)) {
            return fail(400, { message: 'ID del modelo debe ser un número.' });
        }

        // Validar campos requeridos
        if (!fields.marca || typeof fields.marca !== 'string' || fields.marca.trim() === '') {
            errors.marca = 'La marca es obligatoria.';
        }
        if (!fields.modeloNombre || typeof fields.modeloNombre !== 'string' || fields.modeloNombre.trim() === '') {
            errors.modeloNombre = 'El nombre del modelo es obligatorio.';
        }
        if (!fields.capacidadPasajeros || fields.capacidadPasajeros.toString().trim() === '') {
            errors.capacidadPasajeros = 'La capacidad de pasajeros es obligatoria.';
        }
        if (!fields.precioPorDia || fields.precioPorDia.toString().trim() === '') {
            errors.precioPorDia = 'El precio por día es obligatorio.';
        }
        
        // Validar política de cancelación
        const validPoliticas = ["Reembolso Total", "Reembolso Parcial", "Sin Reembolso"] as const;
        if (!fields.tipoPolitica || typeof fields.tipoPolitica !== 'string' || !validPoliticas.includes(fields.tipoPolitica as any)) {
            errors.tipoPolitica = 'El tipo de política de cancelación es inválido o está vacío.';
        }

        // Validar y convertir valores numéricos
        let capacidadPasajerosNum: number | undefined;
        if (fields.capacidadPasajeros && fields.capacidadPasajeros.toString().trim() !== '') {
            capacidadPasajerosNum = parseInt(fields.capacidadPasajeros.toString(), 10);
            if (isNaN(capacidadPasajerosNum) || capacidadPasajerosNum <= 0) {
                errors.capacidadPasajeros = 'La capacidad de pasajeros debe ser un número entero positivo.';
            }
        }

        let precioPorDiaNum: number | undefined;
        if (fields.precioPorDia && fields.precioPorDia.toString().trim() !== '') {
            precioPorDiaNum = parseFloat(fields.precioPorDia.toString());
            if (isNaN(precioPorDiaNum) || precioPorDiaNum <= 0) {
                errors.precioPorDia = 'El precio por día debe ser un número positivo.';
            }
        }
        
        // Validar porcentaje de reembolso parcial
        let porcentajeReembolsoParcialNum: number | null = null;
        if (fields.tipoPolitica === 'Reembolso Parcial') {
            if (!fields.porcentajeReembolsoParcial || fields.porcentajeReembolsoParcial.toString().trim() === '') {
                errors.porcentajeReembolsoParcial = 'El porcentaje de reembolso es obligatorio para reembolso parcial.';
            } else {
                porcentajeReembolsoParcialNum = parseFloat(fields.porcentajeReembolsoParcial.toString());
                if (isNaN(porcentajeReembolsoParcialNum) || porcentajeReembolsoParcialNum < 0 || porcentajeReembolsoParcialNum > 100) {
                    errors.porcentajeReembolsoParcial = 'El porcentaje de reembolso debe ser un número entre 0 y 100.';
                }
            }
        }

        // Validar categoría
        let categoriaId: number | null = null;
        if (fields.categoriaId && fields.categoriaId.toString().trim() !== '') {
            categoriaId = parseInt(fields.categoriaId.toString(), 10);
            if (isNaN(categoriaId) || categoriaId <= 0) {
                errors.categoriaId = 'La categoría seleccionada es inválida.';
            }
        }

        // Manejar la imagen como binario
        let imagenBlob: Buffer | null = null;
        if (fields.imagen && fields.imagen.size > 0) {
            // Validar que el archivo sea una imagen
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
            if (!allowedTypes.includes(fields.imagen.type)) {
                errors.imagen = 'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP o AVIF)';
            } else {
                try {
                    // Convertir la imagen a ArrayBuffer y luego a Buffer
                    const bytes = await fields.imagen.arrayBuffer();
                    imagenBlob = Buffer.from(bytes);
                } catch (error) {
                    console.error('Error processing image:', error);
                    errors.imagen = 'Error al procesar la imagen';
                }
            }
        }

        // Si hay errores, retornar con los datos del formulario
        if (Object.keys(errors).length > 0) {
            return fail(400, {
                errors,
                marca: fields.marca?.toString() ?? '',
                modeloNombre: fields.modeloNombre?.toString() ?? '',
                capacidadPasajeros: fields.capacidadPasajeros?.toString() ?? '',
                precioPorDia: fields.precioPorDia?.toString() ?? '',
                tipoPolitica: fields.tipoPolitica?.toString() ?? '',
                porcentajeReembolsoParcial: fields.porcentajeReembolsoParcial?.toString() ?? '',
                categoriaId: fields.categoriaId?.toString() ?? ''
            });
        }

        // Check for duplicate model (case insensitive) excluding current model
        const existingModel = await db.select()
            .from(modelosVehiculos)
            .where(
                and(
                    sql`LOWER(${modelosVehiculos.marca}) = LOWER(${fields.marca!.toString().trim()})`,
                    sql`LOWER(${modelosVehiculos.modelo}) = LOWER(${fields.modeloNombre!.toString().trim()})`,
                    sql`${modelosVehiculos.id} != ${modeloId}`
                )
            );

        if (existingModel.length > 0) {
            return fail(400, { 
                message: 'Ya existe un modelo con la misma marca y modelo',
                marca: fields.marca?.toString() ?? '',
                modeloNombre: fields.modeloNombre?.toString() ?? '',
                capacidadPasajeros: fields.capacidadPasajeros?.toString() ?? '',
                precioPorDia: fields.precioPorDia?.toString() ?? '',
                tipoPolitica: fields.tipoPolitica?.toString() ?? '',
                porcentajeReembolsoParcial: fields.porcentajeReembolsoParcial?.toString() ?? '',
                categoriaId: fields.categoriaId?.toString() ?? ''
            });
        }

        try {
            // Buscar o crear la política de cancelación
            const tipoPolitica = fields.tipoPolitica as "Reembolso Total" | "Reembolso Parcial" | "Sin Reembolso";
            let politicaRecord = await db.select({ id: politicasCancelacion.id })
                .from(politicasCancelacion)
                .where(eq(politicasCancelacion.tipoPolitica, tipoPolitica))
                .get();

            let idPoliticaCancelacion: number;
            if (!politicaRecord) {
                const newPoliticaRows = await db.insert(politicasCancelacion)
                    .values({ tipoPolitica })
                    .returning({ id: politicasCancelacion.id });
                if (!newPoliticaRows || newPoliticaRows.length === 0 || typeof newPoliticaRows[0].id !== 'number') {
                    throw new Error('No se pudo crear la política de cancelación o recuperar su ID.');
                }
                idPoliticaCancelacion = newPoliticaRows[0].id;
            } else {
                idPoliticaCancelacion = politicaRecord.id;
            }

            // Preparar los datos de actualización
            const updateData = {
                marca: fields.marca!.toString().trim(),
                modelo: fields.modeloNombre!.toString().trim(),
                capacidadPasajeros: capacidadPasajerosNum!,
                precioPorDia: precioPorDiaNum!,
                idCategoria: categoriaId,
                idPoliticaCancelacion,
                porcentajeReembolsoParcial: tipoPolitica === 'Reembolso Parcial' ? porcentajeReembolsoParcialNum : null,
            };

            // Solo actualizar la imagen si se proporcionó una nueva
            if (imagenBlob) {
                (updateData as any).imagenBlob = imagenBlob;
            }

            await db.update(modelosVehiculos)
                .set(updateData)
                .where(eq(modelosVehiculos.id, modeloId))
                .run();

            return {
                success: true,
                redirect: '/admin/modelos?toast=modelo-actualizado'
            };

        } catch (dbError: any) {
            console.error("Error al actualizar el modelo:", dbError);
            return fail(500, { message: dbError.message || 'Error interno del servidor al actualizar el modelo.' });
        }
    }
};
