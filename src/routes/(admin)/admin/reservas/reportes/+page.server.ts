import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { reservas, sucursales } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {
    const user = locals.user!;

    // Obtener parámetros de fecha del query string
    const fechaInicio = url.searchParams.get('fechaInicio');
    const fechaFin = url.searchParams.get('fechaFin');

    // Construir la cláusula WHERE base para el filtro de fechas
    let whereClause = sql`1=1`;
    
    if (fechaInicio && fechaFin) {
        whereClause = sql`${reservas.fechaCreacion} BETWEEN strftime('%s', ${fechaInicio}) AND strftime('%s', date(${fechaFin}, '+1 day'))`;
    }

    // Consulta para cantidad de reservas por sucursal (incluye todas las reservas)
    const cantidadPorSucursal = await db
        .select({
            sucursal: sucursales.nombre,
            cantidad: sql<number>`count(*)`,
        })
        .from(reservas)
        .innerJoin(sucursales, sql`${sucursales.id} = ${reservas.idSucursal}`)
        .where(whereClause)
        .groupBy(sucursales.id, sucursales.nombre);

    // Consulta para ingresos totales por sucursal (excluye reservas canceladas)
    const ingresosPorSucursal = await db
        .select({
            sucursal: sucursales.nombre,
            ingresos: sql<number>`COALESCE(sum(${reservas.importeTotal}), 0)`,
        })
        .from(reservas)
        .innerJoin(sucursales, sql`${sucursales.id} = ${reservas.idSucursal}`)
        .where(sql`${whereClause}`)
        .groupBy(sucursales.id, sucursales.nombre);

    // Consulta para ingresos de adicionales por sucursal
    const ingresosAdicionalesPorSucursal = await db
        .select({
            sucursal: sucursales.nombre,
            ingresosAdicionales: sql<number>`COALESCE(sum(${reservas.importeAdicionales}), 0)`,
        })
        .from(reservas)
        .innerJoin(sucursales, sql`${sucursales.id} = ${reservas.idSucursal}`)
        .where(whereClause)
        .groupBy(sucursales.id, sucursales.nombre);

    // Calcular totales
    const totalReservas = cantidadPorSucursal.reduce((sum, item) => sum + item.cantidad, 0);
    const totalIngresos = ingresosPorSucursal.reduce((sum, item) => sum + Number(item.ingresos), 0);
    const totalIngresosAdicionales = ingresosAdicionalesPorSucursal.reduce(
        (acc, curr) => acc + (curr.ingresosAdicionales ?? 0), 0
    );

    return {
        cantidadPorSucursal,
        ingresosPorSucursal,
        ingresosAdicionalesPorSucursal,
        totalReservas,
        totalIngresos,
        totalIngresosAdicionales
    };
}) satisfies PageServerLoad;
