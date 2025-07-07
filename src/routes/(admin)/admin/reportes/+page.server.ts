import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { reservas, sucursales, modelosVehiculos, categoriasVehiculos, adicionales, reservasAdicionales, usuarios } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {
    const user = locals.user!;

    // Obtener parámetros de fecha del query string
    const fechaInicio = url.searchParams.get('fechaInicio');
    const fechaFin = url.searchParams.get('fechaFin');
    const mes = url.searchParams.get('mes');

    // Construir la cláusula WHERE base para el filtro de fechas
    let whereClause = sql`1=1`;
    
    if (fechaInicio && fechaFin) {
        whereClause = sql`${reservas.fechaCreacion} BETWEEN strftime('%s', ${fechaInicio}) AND strftime('%s', date(${fechaFin}, '+1 day'))`;
    } else if (mes) {
        // Si se especifica un mes (formato YYYY-MM)
        const inicioMes = sql`${mes} || '-01'`;
        const finMes = sql`date(${mes} || '-01', '+1 month')`;
        whereClause = sql`${reservas.fechaCreacion} BETWEEN strftime('%s', ${inicioMes}) AND strftime('%s', ${finMes})`;
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

    // Consulta para cantidad de reservas por modelo
    const cantidadPorModelo = await db
        .select({
            modelo: sql<string>`(${modelosVehiculos.marca} || ' ' || ${modelosVehiculos.modelo})`,
            cantidad: sql<number>`count(*)`,
        })
        .from(reservas)
        .innerJoin(modelosVehiculos, sql`${modelosVehiculos.id} = ${reservas.idModeloReservado}`)
        .where(whereClause)
        .groupBy(modelosVehiculos.id, modelosVehiculos.marca, modelosVehiculos.modelo);

    // Consulta para cantidad de reservas por categoría
    const cantidadPorCategoria = await db
        .select({
            categoria: categoriasVehiculos.nombre,
            cantidad: sql<number>`count(*)`,
        })
        .from(reservas)
        .innerJoin(modelosVehiculos, sql`${modelosVehiculos.id} = ${reservas.idModeloReservado}`)
        .innerJoin(categoriasVehiculos, sql`${categoriasVehiculos.id} = ${modelosVehiculos.idCategoria}`)
        .where(whereClause)
        .groupBy(categoriasVehiculos.id, categoriasVehiculos.nombre);

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

    // Adicional más vendido y su monto total
    const adicionalesStats = await db
        .select({
            id: adicionales.id,
            nombre: adicionales.nombre,
            montoTotal: sql<number>`COALESCE(sum(${adicionales.precioPorDia}), 0)`,
            cantidad: sql<number>`count(*)`
        })
        .from(reservasAdicionales)
        .innerJoin(adicionales, sql`${adicionales.id} = ${reservasAdicionales.idAdicional}`)
        .innerJoin(reservas, sql`${reservas.id} = ${reservasAdicionales.idReserva}`)
        .where(whereClause)
        .groupBy(adicionales.id, adicionales.nombre);

    let adicionalMasVendido = null;
    if (adicionalesStats.length > 0) {
        adicionalMasVendido = adicionalesStats.reduce((max, item) => item.cantidad > max.cantidad ? item : max, adicionalesStats[0]);
    }

    // Listado de reservas con detalles
    const reservasListado = await db
        .select({
            id: reservas.id,
            categoria: categoriasVehiculos.nombre,
            sucursal: sucursales.nombre,
            estado: reservas.estado,
            importeTotal: reservas.importeTotal,
            importeAdicionales: reservas.importeAdicionales,
            usuario: usuarios.nombre
        })
        .from(reservas)
        .leftJoin(modelosVehiculos, sql`${modelosVehiculos.id} = ${reservas.idModeloReservado}`)
        .leftJoin(categoriasVehiculos, sql`${categoriasVehiculos.id} = ${modelosVehiculos.idCategoria}`)
        .leftJoin(sucursales, sql`${sucursales.id} = ${reservas.idSucursal}`)
        .leftJoin(usuarios, sql`${usuarios.id} = ${reservas.idUsuario}`)
        .where(whereClause)
        .orderBy(sql`fechaCreacion DESC`);

    return {
        cantidadPorSucursal,
        ingresosPorSucursal,
        ingresosAdicionalesPorSucursal,
        cantidadPorModelo,
        cantidadPorCategoria,
        totalReservas,
        totalIngresos,
        totalIngresosAdicionales,
        adicionalMasVendido,
        reservasListado
    };
}) satisfies PageServerLoad;
