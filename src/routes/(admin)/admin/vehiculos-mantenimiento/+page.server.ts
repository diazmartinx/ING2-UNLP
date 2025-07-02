import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { unidadesVehiculos, sucursales, modelosVehiculos } from '$lib/server/db/schema';
import { eq, like, and } from 'drizzle-orm';

export const load = async ({ locals, url }) => {
    if (!locals.user || locals.user.rol !== 'empleado') {
        throw redirect(302, '/');
    }

    const search = url.searchParams.get('patente')?.trim() ?? '';

    const where = [
        eq(unidadesVehiculos.estado, 'Inhabilitado')
    ];
    if (search) {
        where.push(like(unidadesVehiculos.patente, `%${search}%`));
    }

    const unidades = await db
        .select({
            patente: unidadesVehiculos.patente,
            anio: unidadesVehiculos.anio,
            sucursal: sucursales.nombre,
            modelo: modelosVehiculos.modelo,
            marca: modelosVehiculos.marca
        })
        .from(unidadesVehiculos)
        .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
        .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
        .where(and(...where))
        .orderBy(unidadesVehiculos.patente)
        .all();

    return { unidades, search };
};

export const actions = {
    habilitar: async ({ request, locals }) => {
        if (!locals.user || locals.user.rol !== 'empleado') {
            throw error(403, 'No autorizado');
        }
        const data = await request.formData();
        const patente = data.get('patente');
        if (!patente || typeof patente !== 'string') throw error(400, 'Patente requerida');

        await db.update(unidadesVehiculos)
            .set({ estado: 'Habilitado' })
            .where(eq(unidadesVehiculos.patente, patente));

        return { success: true };
    }
};