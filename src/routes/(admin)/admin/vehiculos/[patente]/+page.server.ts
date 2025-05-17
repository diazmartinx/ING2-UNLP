import { unidadesVehiculos } from '$lib/server/db/schema';
import { reservas } from '$lib/server/db/schema';
import { sucursales } from '$lib/server/db/schema'
import { modelosVehiculos } from '$lib/server/db/schema';
import { categoriasVehiculos } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';


export async function load ({ params }) {
    
    const vehiculos = await db.select().from(unidadesVehiculos).where(eq(unidadesVehiculos.patente  , params.patente));
    if (vehiculos.length === 0) {
        throw error(404, 'Vehículo no encontrado');
    }

    const vehiculo = vehiculos[0];
    const reservasVehiculo = await db.select().from(reservas).where(eq(reservas.patenteUnidadReservada, vehiculo.patente));
    const sucursal = await db.select().from(sucursales).where(eq(sucursales.id, Number(vehiculo.idSucursal)));
    const modelo = await db.select().from(modelosVehiculos).where(eq(modelosVehiculos.id, Number(vehiculo.idModelo)));
    const categoria = await db.select().from(categoriasVehiculos).where(eq(categoriasVehiculos.id, Number(modelo[0].idCategoria)));
    
    const vehiculoFinal = {
        ...vehiculo,
        reservas: reservasVehiculo,
        sucursal: sucursal[0],
        modelo: modelo[0],
        categoria: categoria[0]
    };

    console.log(vehiculoFinal);

    return {
        vehiculo: vehiculoFinal
    };
}