import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { and, eq, or, like } from 'drizzle-orm';

export const load = (async ({ locals, url }) => {
    const user = locals.user!

    if (!user) {
        return { error: 'No estás autenticado' };
    }

    if (user.rol == 'cliente') {
        redirect(302, '/admin/mis-reservas');
    }

    const busqueda = url.searchParams.get('buscar') || '';

	const where = and(
		eq(usuarios.rol, 'cliente'),
		eq(usuarios.estado, 'activo'),
		busqueda
			? or(
					like(usuarios.nombre, `%${busqueda}%`),
					like(usuarios.apellido, `%${busqueda}%`),
					like(usuarios.dni, `%${busqueda}%`)
				)
			: undefined
	);

	const clientesDB = await db.select().from(usuarios).where(where);

    return {user, clientes: clientesDB, busqueda};
}) satisfies PageServerLoad;