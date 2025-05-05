import { db } from '$lib/server/db';
import { categoriaTabla } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {

    const categorias = await db.select().from(categoriaTabla)

    return {categorias};
    
}) satisfies PageServerLoad;