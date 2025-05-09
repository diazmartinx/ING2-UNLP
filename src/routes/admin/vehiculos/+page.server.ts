import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import {unidadesVehiculos, sucursales, modelosVehiculos} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

        // Validar que la patente no esté vacía
        if (!patente || patente.trim() === '') {
            return fail(400, { error: 'La patente es obligatoria.' });
        }

        // Validar que la patente no exista
        const existePatente = await db
            .select()
            .from(unidadesVehiculos)
            .where(eq(unidadesVehiculos.patente, patente));

        if (existePatente.length > 0) {
            return fail(400, { error: 'La patente ya existe en el sistema.' });
        }

        // Validar que la sucursal y el modelo existan
        const sucursalExiste = await db
            .select()
            .from(sucursales)
            .where(eq(sucursales.id, idSucursal));
        const modeloExiste = await db
            .select()
            .from(modelosVehiculos)
            .where(eq(modelosVehiculos.id, idModelo));

        if (sucursalExiste.length === 0 || modeloExiste.length === 0) {
            return fail(400, { error: 'Sucursal o modelo inválido.' });
        }

        // Insertar el nuevo vehículo
        await db.insert(unidadesVehiculos).values({
            patente,
            idSucursal: String(idSucursal),
            estado: 'Habilitado'
        });

        return { success: true };
    }
};
