import { db } from '$lib/server/db';
import { categoriasVehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {

    const categorias = await db.select().from(categoriasVehiculos)

    return {categorias};
    
}) satisfies PageServerLoad;