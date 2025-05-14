import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import {unidadesVehiculos, sucursales, modelosVehiculos, reservas} from '$lib/server/db/schema';
import { eq, ne, and } from 'drizzle-orm';
import { error, type Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    const vehiculos = await db.select().from(unidadesVehiculos);
    const sucursalesDisponibles = await db.select().from(sucursales);
    const modelosDisponibles = await db.select().from(modelosVehiculos);

    return {
        vehiculos,
        sucursales: sucursalesDisponibles,
        modelos: modelosDisponibles
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    agregarVehiculo: async ({ request }) => {
        const data = await request.formData();
        const patente = String(data.get('patente'));
        const idSucursal = Number(data.get('idSucursal'));
        const idModelo = Number(data.get('idModelo'));
        const anio = Number(data.get('anio'));

        // Validar que la patente no exista
        const existePatente = await db
        .select()
        .from(unidadesVehiculos)
        .where(eq(unidadesVehiculos.patente, patente))
        .limit(1); // más eficiente

        if (existePatente.length > 0){
            if (existePatente[0].estado === 'Dado de baja'){
                await db.update(unidadesVehiculos).set({estado: "Habilitado", idSucursal: String(idSucursal), idModelo: String(idModelo), anio: anio})
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
                idModelo: String(idModelo),
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

    darDeBaja: async ({ request }) => {
        try {
            const data = await request.json();
            const { patente } = data;

            // Verificar si hay reservas pendientes
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
                    error: 'La unidad está en uso'
                });
            }

            // Actualizar el estado del vehículo
            await db
                .update(unidadesVehiculos)
                .set({ estado: 'Dado de baja' })
                .where(eq(unidadesVehiculos.patente, patente));

            return {
                success: true
            };

        } catch (err) {
            return fail(500, {
                success: false,
                error: 'Error al dar de baja el vehículo.'
            });
        }
    }
};
