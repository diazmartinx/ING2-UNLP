import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({locals}) => {
    const user = locals.user;

    if (!user) {
        redirect(302, '/ingresar');
    }
    
    
    return {
        user
    };
}) satisfies LayoutServerLoad;