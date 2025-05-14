import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';
import {unidadesVehiculos} from '$lib/server/db/schema';

export async function load({params}){
    const vehiculos = await db.select().from(unidadesVehiculos);

    return {
        vehiculos
    };
}

