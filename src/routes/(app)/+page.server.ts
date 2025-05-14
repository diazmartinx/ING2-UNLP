import type { PageServerLoad, Actions } from './$types';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sucursales } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
    const sucursalesDisponibles = await db.select().from(sucursales);
    return {
        user: locals.user || null,
        sucursales: sucursalesDisponibles
    };
};

export const actions: Actions = {
    logout: async (event) => {

        if (!event.locals.session) {
            return fail(401);
        }
        await auth.invalidateSession(event.locals.session.id);
        auth.deleteSessionTokenCookie(event);
        throw redirect(303, '/');
    }
};