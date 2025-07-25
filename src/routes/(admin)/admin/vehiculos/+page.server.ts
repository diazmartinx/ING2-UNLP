import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import {unidadesVehiculos, sucursales, modelosVehiculos, reservas} from '$lib/server/db/schema';
import { eq, ne, and, not } from 'drizzle-orm';
import { error, type Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    const vehiculos = await db.select().from(unidadesVehiculos).where(not(eq(unidadesVehiculos.estado, 'Dado de baja')));
    const sucursalesDisponibles = await db.select().from(sucursales);
    const modelosDisponibles = await db.select().from(modelosVehiculos);

    // Serializar los modelos para manejar el blob de imagen
    const modelosSerializados = modelosDisponibles.map(modelo => ({
        ...modelo,
        imagenBlob: modelo.imagenBlob instanceof Buffer ? modelo.imagenBlob.toString('base64') : null
    }));

    return {
        vehiculos,
        sucursales: sucursalesDisponibles,
        modelos: modelosSerializados
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    agregarVehiculo: async ({ request }) => {
        const data = await request.formData();
        let patente = String(data.get('patente'));
        const idSucursal = Number(data.get('idSucursal'));
        const idModelo = Number(data.get('idModelo'));
        const anio = Number(data.get('anio'));

        if (!patente || !idSucursal || !idModelo || !anio || isNaN(anio) || !isFinite(anio)) {
            return {
                success: false,
                error: 'Todos los campos son requeridos y deben ser válidos.'
            };
        }

        // Normalizar patente
        patente = patente.trim().toUpperCase();

        // Validar formato de patente (vieja: ABC123 o nueva/mercosur: AB123CD)
        const formatoValido = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
        
        if (!formatoValido.test(patente)) {
            return {
                success: false,
                error: 'Formato de patente inválido. Use AAA999 o AA999AA'
            };
        }

        // Validar que la patente no exista
        const existePatente = await db
        .select()
        .from(unidadesVehiculos)
        .where(eq(unidadesVehiculos.patente, patente))
        .limit(1); // más eficiente

        if (existePatente.length > 0){
            if (existePatente[0].estado === 'Dado de baja'){
                await db.update(unidadesVehiculos).set({estado: "Habilitado", idSucursal: String(idSucursal), idModelo: idModelo, anio: anio})
                                            .where(eq(unidadesVehiculos.patente, patente));
                return{
                    success: true
                }
            }
            else{
                return {
                    success: false,
                    error: 'La patente ya existe en el sistema.'
                };
            }
        }

        try {
            // Insertar el nuevo vehículo
            const nuevoVehiculo = await db.insert(unidadesVehiculos).values({
                patente,
                idSucursal: String(idSucursal),
                idModelo: idModelo,
                estado: 'Habilitado',
                anio: anio
            }).returning();

            if (!nuevoVehiculo || nuevoVehiculo.length === 0) {
                return{
                    success: false,
                    error: 'Error al insertar el vehículo en la base de datos.'
                };
            }

            return {
                success: true,
                patente: nuevoVehiculo[0].patente,
                idSucursal: String(idSucursal),
                idModelo: String(idModelo),
                anio: Number(nuevoVehiculo[0].anio),
            };

        } catch (err) {
            return {
                success: false,
                error: 'Error al insertar el vehículo en la base de datos.'
            };
        }
    },

    actualizarEstadoVehiculo: async ({ request }) => {
        try {
            const data = await request.json();
            const { patente, nuevoEstado } = data;

            // Verificar si hay reservas relacionadas (cualquier estado) cuando se intenta dar de baja
            if (nuevoEstado === 'Dado de baja') {
                const reservasRelacionadas = await db
                    .select()
                    .from(reservas)
                    .where(eq(reservas.patenteUnidadAsignada, patente))
                    .limit(1);

                if (reservasRelacionadas.length > 0) {
                    return fail(400, {
                        success: false,
                        error: 'No se puede dar de baja la unidad porque tiene reservas asociadas'
                    });
                }
            } else {
                // Para otros estados (Habilitado/Inhabilitado), solo verificar reservas pendientes
                const reservasPendientes = await db
                    .select()
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.patenteUnidadAsignada, patente),
                            eq(reservas.estado, 'Pendiente')
                        )
                    )
                    .limit(1);

                if (reservasPendientes.length > 0) {
                    return fail(400, {
                        success: false,
                        error: 'La unidad posee reservas pendientes'
                    });
                }
            }

            // Actualizar el estado del vehículo
            await db
                .update(unidadesVehiculos)
                .set({ estado: nuevoEstado })
                .where(eq(unidadesVehiculos.patente, patente));

            return {
                success: true
            };

        } catch (err) {
            return fail(500, {
                success: false,
                error: 'Error al actualizar el estado del vehículo. Posee reservas.'
            });
        }
    }
};
