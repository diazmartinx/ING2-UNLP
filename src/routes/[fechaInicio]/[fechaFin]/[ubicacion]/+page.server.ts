import { db } from '$lib/server/db';
import { unidadesVehiculos, modelosVehiculos, reservas, sucursales } from '$lib/server/db/schema';
import { eq, and, or, not, exists, lte, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

type UnidadDisponible = {
    patente: string;
    estado: string;
    marca: string;
    modelo: string;
    anio: number;
    capacidadPasajeros: number;
    precioPorDia: number;
    imagenUrl: string;
    nombreSucursal: string;
};

export const load: PageServerLoad = async ({ params }) => {
    const { fechaInicio, fechaFin, ubicacion } = params;
    
    // Convert string dates to Date objects
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Get available vehicles
    const unidadesDisponibles = await db.select({
        patente: unidadesVehiculos.patente,
        estado: unidadesVehiculos.estado,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo,
        anio: unidadesVehiculos.anio,
        capacidadPasajeros: modelosVehiculos.capacidadPasajeros,
        precioPorDia: modelosVehiculos.precioPorDia,
        imagenUrl: modelosVehiculos.imagenUrl,
        nombreSucursal: sucursales.nombre
    })
    .from(unidadesVehiculos)
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .leftJoin(sucursales, eq(unidadesVehiculos.idSucursal, sucursales.id))
    .where(
        and(
            eq(unidadesVehiculos.estado, 'Habilitado'),
            eq(sucursales.nombre, ubicacion),
            not(
                exists(
                    db.select()
                    .from(reservas)
                    .where(
                        and(
                            eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente),
                            or(
                                and(
                                    lte(reservas.fechaInicio, fechaFinDate),
                                    gte(reservas.fechaFin, fechaInicioDate)
                                )
                            ),
                            eq(reservas.estado, 'Pendiente')
                        )
                    )
                )
            )
        )
    );

    return {
        fechaInicio,
        fechaFin,
        ubicacion,
        unidadesDisponibles: unidadesDisponibles as UnidadDisponible[]
    };
}; 