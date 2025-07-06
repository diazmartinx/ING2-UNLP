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
    const reservasVehiculo = await db.select().from(reservas).where(eq(reservas.patenteUnidadAsignada, vehiculo.patente));
    
    // Obtener sucursal si existe
    let sucursal = null;
    if (vehiculo.idSucursal) {
        const sucursalResult = await db.select().from(sucursales).where(eq(sucursales.id, Number(vehiculo.idSucursal)));
        sucursal = sucursalResult[0] || null;
    }
    
    // Obtener modelo si existe
    let modelo = null;
    let categoria = null;
    if (vehiculo.idModelo) {
        const modeloResult = await db.select().from(modelosVehiculos).where(eq(modelosVehiculos.id, Number(vehiculo.idModelo)));
        modelo = modeloResult[0] || null;
        
        // Obtener categoría si el modelo existe y tiene categoría
        if (modelo && modelo.idCategoria) {
            const categoriaResult = await db.select().from(categoriasVehiculos).where(eq(categoriasVehiculos.id, Number(modelo.idCategoria)));
            categoria = categoriaResult[0] || null;
        }
    }
    
    const vehiculoFinal = {
        ...vehiculo,
        reservas: reservasVehiculo,
        sucursal,
        modelo,
        categoria
    };

    return {
        vehiculo: vehiculoFinal
    };
}