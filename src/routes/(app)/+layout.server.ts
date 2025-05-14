import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // Si tu autenticación guarda el usuario en locals.user, lo exponemos
    return {
        user: locals.user ?? null
    };
}; 