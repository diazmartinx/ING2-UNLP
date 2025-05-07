import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({locals}) => {
    const user = await locals.user;

    if (!user) {
        redirect(302, '/');
    }
    
    
    return {
        user
    };
}) satisfies LayoutServerLoad;