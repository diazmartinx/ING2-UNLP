import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { fechaInicio, fechaFin, ubicacion, marca, modelo } = params;

    return {
        fechaInicio: fechaInicio || '',
        fechaFin: fechaFin || '',
        ubicacion: ubicacion || '',
        marca: marca || '',
        modelo: modelo || ''
    };
};