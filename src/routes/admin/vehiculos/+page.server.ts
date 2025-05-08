import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import {unidadesVehiculos} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    const vehiculos = await db.select().from(unidadesVehiculos);

    if (vehiculos.length === 0) {
        throw error(404, 'No hay vehículos registrados');
    }
    return {
        vehiculos: vehiculos
    };
}) satisfies PageServerLoad;