import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq, ne } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({params}){

    const clienteDB = await db.select().from(usuarios).where(eq(usuarios.id, Number(params.id)));
    console.log(clienteDB);

    if (clienteDB.length === 0){
        error(404, 'Cliente no encontrado!');
    }

    return {
        cliente: clienteDB[0]
    }
}