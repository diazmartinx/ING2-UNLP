import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;

    // TODO: Add data fetching logic here based on params

    return {
        fechaInicio,
        fechaFin,
        ubicacion
    };
}; 