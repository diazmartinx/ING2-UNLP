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

        // Validar que la patente no exista (excluyendo vehículos dados de baja)
        const existePatente = await db
        .select({ id: unidadesVehiculos.patente })
        .from(unidadesVehiculos)
        .where(
          and(
            eq(unidadesVehiculos.patente, patente),
            ne(unidadesVehiculos.estado, 'Dado de baja')
          )
        )
        .limit(1); // más eficiente

        if (existePatente.length > 0) {
            return fail(400, {
                success: false,
                error: 'La patente ya existe en el sistema.'
            });
        }

        try {
            // Insertar el nuevo vehículo
            const nuevoVehiculo = await db.insert(unidadesVehiculos).values({
                patente,
                idSucursal: String(idSucursal),
                idModelo: String(idModelo),
                estado: 'Habilitado'
            }).returning();

            if (!nuevoVehiculo || nuevoVehiculo.length === 0) {
                return fail(500, {
                    success: false,
                    error: 'Error al insertar el vehículo en la base de datos.'
                });
            }

            return {
                success: true,
                vehiculo: {
                    ...nuevoVehiculo[0],
                    idSucursal: idSucursal,
                    idModelo: idModelo,
                    estado: 'Habilitado'
                }
            };

        } catch (err) {
            return fail(500, {
                success: false,
                error: 'Error al insertar el vehículo en la base de datos.'
            });
        }
    },

    darDeBaja: async ({ request }) => {
        try {
            const data = await request.json();
            const { patente } = data;

            if (!patente) {
                return fail(400, {
                    success: false,
                    error: 'La patente es obligatoria.'
                });
            }

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
