import { db } from '$lib/server/db';
import { modelosVehiculos, categoriasVehiculos, politicasCancelacion } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

export const load = (async () => {
    const modelos = await db.select({
        id: modelosVehiculos.id,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenUrl: modelosVehiculos.imagenUrl,
        categoria: categoriasVehiculos.nombre,
        politicaCancelacion: politicasCancelacion.tipoPolitica,
        porcentajeReembolsoParcial: modelosVehiculos.porcentajeReembolsoParcial
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

            // Manejar la subida de la imagen
            const imagen = formData.get('imagen') as File;
            if (!imagen) {
                return fail(400, { message: 'La imagen es requerida' });
            }

            // Validar que el archivo sea una imagen
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
            if (!allowedTypes.includes(imagen.type)) {
                return fail(400, { message: 'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP o AVIF)' });
            }

            try {
                // Generar un nombre único para el archivo
                const extension = imagen.name.split('.').pop();
                const fileName = `${uuidv4()}.${extension}`;
                const filePath = join(process.cwd(), 'static', 'uploads', 'modelos', fileName);

                // Asegurarse de que el directorio existe
                await mkdir(join(process.cwd(), 'static', 'uploads', 'modelos'), { recursive: true });

                // Guardar el archivo
                const bytes = await imagen.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filePath, buffer);

                // Guardar la ruta relativa en la base de datos
                const imagenUrl = `/uploads/modelos/${fileName}`;

                await db.insert(modelosVehiculos).values({
                    marca,
                    modelo,
                    capacidadPasajeros,
                    precioPorDia,
                    imagenUrl,
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
    }
} satisfies Actions;