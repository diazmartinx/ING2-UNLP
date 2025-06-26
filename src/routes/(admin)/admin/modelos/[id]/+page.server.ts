import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

        const idStr = formData.get('id');
        const marca = formData.get('marca');
        const modeloNombre = formData.get('modeloNombre');
        const capacidadPasajerosStr = formData.get('capacidadPasajeros');
        const precioPorDiaStr = formData.get('precioPorDia');
        const tipoPolitica = formData.get('tipoPolitica');
        const porcentajeReembolsoParcialStr = formData.get('porcentajeReembolsoParcial');
        const categoriaIdStr = formData.get('categoriaId');

        const errors: Record<string, string> = {};
        
        let modeloId: number;
        if (!idStr || typeof idStr.toString() !== 'string') {
             // This case should ideally not be reached if form is correctly structured
            return fail(500, { message: 'ID del modelo es inválido o no proporcionado.'});
        }
        modeloId = parseInt(idStr.toString(), 10);
        if (isNaN(modeloId)) {
            return fail(400, { message: 'ID del modelo debe ser un número.' });
        }

        if (!marca || typeof marca !== 'string' || marca.trim() === '') {
            errors.marca = 'La marca es obligatoria.';
        }
        if (!modeloNombre || typeof modeloNombre !== 'string' || modeloNombre.trim() === '') {
            errors.modeloNombre = 'El nombre del modelo es obligatorio.';
        }
        if (!capacidadPasajerosStr || capacidadPasajerosStr.toString().trim() === '') {
            errors.capacidadPasajeros = 'La capacidad de pasajeros es obligatoria.';
        }
        if (!precioPorDiaStr || precioPorDiaStr.toString().trim() === '') {
            errors.precioPorDia = 'El precio por día es obligatorio.';
        }
        
        const validPoliticas = ["Reembolso Total", "Reembolso Parcial", "Sin Reembolso"];
        if (!tipoPolitica || typeof tipoPolitica !== 'string' || !validPoliticas.includes(tipoPolitica)) {
            errors.tipoPolitica = 'El tipo de política de cancelación es inválido o está vacío.';
        }

        let capacidadPasajerosNum: number | undefined;
        if (capacidadPasajerosStr && capacidadPasajerosStr.toString().trim() !== '') {
            capacidadPasajerosNum = parseInt(capacidadPasajerosStr.toString(), 10);
            if (isNaN(capacidadPasajerosNum) || capacidadPasajerosNum <= 0) {
                errors.capacidadPasajeros = 'La capacidad de pasajeros debe ser un número entero positivo.';
            }
        }

        let precioPorDiaNum: number | undefined;
        if (precioPorDiaStr && precioPorDiaStr.toString().trim() !== '') {
            precioPorDiaNum = parseFloat(precioPorDiaStr.toString());
            if (isNaN(precioPorDiaNum) || precioPorDiaNum <= 0) {
                errors.precioPorDia = 'El precio por día debe ser un número positivo.';
            }
        }
        
        let porcentajeReembolsoParcialNum: number | null = null;
        if (tipoPolitica === 'Reembolso Parcial') {
            if (!porcentajeReembolsoParcialStr || porcentajeReembolsoParcialStr.toString().trim() === '') {
                errors.porcentajeReembolsoParcial = 'El porcentaje de reembolso es obligatorio para reembolso parcial.';
            } else {
                porcentajeReembolsoParcialNum = parseFloat(porcentajeReembolsoParcialStr.toString());
                if (isNaN(porcentajeReembolsoParcialNum) || porcentajeReembolsoParcialNum < 0 || porcentajeReembolsoParcialNum > 100) {
                    errors.porcentajeReembolsoParcial = 'El porcentaje de reembolso debe ser un número entre 0 y 100.';
                }
            }
        }

        // Validar categoría
        let categoriaId: number | null = null;
        if (categoriaIdStr && categoriaIdStr.toString().trim() !== '') {
            categoriaId = parseInt(categoriaIdStr.toString(), 10);
            if (isNaN(categoriaId) || categoriaId <= 0) {
                errors.categoriaId = 'La categoría seleccionada es inválida.';
            }
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, {
                errors,
                marca: marca?.toString(),
                modeloNombre: modeloNombre?.toString(),
                capacidadPasajeros: capacidadPasajerosStr?.toString(),
                precioPorDia: precioPorDiaStr?.toString(),
                tipoPolitica: tipoPolitica?.toString(),
                porcentajeReembolsoParcial: porcentajeReembolsoParcialStr?.toString(),
                categoriaId: categoriaIdStr?.toString()
            });
        }

        try {
            let politicaRecord = await db.select({ id: politicasCancelacion.id })
                .from(politicasCancelacion)
                .where(eq(politicasCancelacion.tipoPolitica, tipoPolitica as "Reembolso Total" | "Reembolso Parcial" | "Sin Reembolso"))
                .get();

            let idPoliticaCancelacion: number;
            if (!politicaRecord) {
                const newPoliticaRows = await db.insert(politicasCancelacion)
                    .values({ tipoPolitica: tipoPolitica as "Reembolso Total" | "Reembolso Parcial" | "Sin Reembolso" })
                    .returning({ id: politicasCancelacion.id });
                if (!newPoliticaRows || newPoliticaRows.length === 0 || typeof newPoliticaRows[0].id !== 'number') {
                    throw new Error('No se pudo crear la política de cancelación o recuperar su ID.');
                }
                idPoliticaCancelacion = newPoliticaRows[0].id;
            } else {
                idPoliticaCancelacion = politicaRecord.id;
            }

            await db.update(modelosVehiculos)
                .set({
                    marca: marca!.toString().trim(),
                    modelo: modeloNombre!.toString().trim(),
                    capacidadPasajeros: capacidadPasajerosNum!,
                    precioPorDia: precioPorDiaNum!,
                    idCategoria: categoriaId,
                    idPoliticaCancelacion: idPoliticaCancelacion,
                    porcentajeReembolsoParcial: tipoPolitica === 'Reembolso Parcial' ? porcentajeReembolsoParcialNum : null,
                })
                .where(eq(modelosVehiculos.id, modeloId))
                .run();

            return { success: true, message: 'Modelo actualizado correctamente.' };

        } catch (dbError: any) {
            console.error("Error al actualizar el modelo:", dbError);
            return fail(500, { message: dbError.message || 'Error interno del servidor al actualizar el modelo.' });
        }
    }
};
