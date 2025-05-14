
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load() {	

    const clientesDB = await db.select().from(usuarios).where(eq(usuarios.rol, 'cliente'));

    return {
        clientes: clientesDB
    }

}