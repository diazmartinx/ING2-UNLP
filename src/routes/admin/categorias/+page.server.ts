import { db } from '$lib/server/db';
import { categorias_vehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {

    const categorias = await db.select().from(categorias_vehiculos);

    return {categorias};
    
}) satisfies PageServerLoad;