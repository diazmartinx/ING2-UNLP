import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
export const load = (async ({ locals }) => {
    const user = locals.user!

    if (!user) {
        return { error: 'No estás autenticado' };
    }

    if (user.rol == 'cliente') {
        redirect(302, '/admin/mis-reservas');
    }

    return {user};
}) satisfies PageServerLoad;