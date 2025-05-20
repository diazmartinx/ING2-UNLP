import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { reservas, unidadesVehiculos, usuarios, modelosVehiculos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
    const id = Number(params.id);
    
    if (isNaN(id)) {
        throw error(400, 'ID de reserva inválido');
    }

    const reserva = await db.select({
        id: reservas.id,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        fechaCreacion: reservas.fechaCreacion,
        estado: reservas.estado,
        dniCliente: usuarios.dni,
        patenteUnidadAsignada: reservas.patenteUnidadAsignada,
        nombreCliente: usuarios.nombre,
        apellidoCliente: usuarios.apellido,
        emailCliente: usuarios.email,
        telefonoCliente: usuarios.telefono,
        modeloVehiculo: unidadesVehiculos.idModelo,
        anioVehiculo: unidadesVehiculos.anio,
        imagenVehiculo: modelosVehiculos.imagenBlob,
        marcaVehiculo: modelosVehiculos.marca,
        nombreModelo: modelosVehiculos.modelo
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadAsignada, unidadesVehiculos.patente))
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .where(eq(reservas.id, id))
    .limit(1);

    if (!reserva || reserva.length === 0) {
        throw error(404, 'Reserva no encontrada');
    }

    // Convertir el blob de imagen a base64
    const reservaSerializada = {
        ...reserva[0],
        imagenVehiculo: reserva[0].imagenVehiculo instanceof Buffer ? reserva[0].imagenVehiculo.toString('base64') : null
    };

    return {
        reserva: reservaSerializada
    };
}) satisfies PageServerLoad; 