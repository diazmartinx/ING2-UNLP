import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    // Este layout no necesita cargar datos adicionales
    // Los datos del vehículo se cargan en +page.server.ts
    return {};
};

