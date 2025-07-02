import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit'; // Removed fail
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
