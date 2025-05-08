import { unidadesVehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function load ({ params }) {
    console.log(params.patente);
    const vehiculo = await db.select().from(unidadesVehiculos).where(eq(unidadesVehiculos.patente  , params.patente));
    console.log(vehiculo);

    if (vehiculo.length === 0) {
        throw error(404, 'Vehículo no encontrado');
    }
    
    return {
        vehiculo: vehiculo[0]
    };
}