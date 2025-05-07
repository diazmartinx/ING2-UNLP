import type { PageServerLoad, Actions } from './$types';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    return {
        user: locals.user || null
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