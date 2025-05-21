import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { reservas, unidadesVehiculos, modelosVehiculos, usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
    const reservaId = parseInt(params.id);
    
    if (isNaN(reservaId)) {
        throw error(400, 'ID de reserva inválido');
    }

    const [reserva] = await db.select({
        id: reservas.id,
        fechaInicio: reservas.fechaInicio,
        fechaFin: reservas.fechaFin,
        estado: reservas.estado,
        nombreCliente: usuarios.nombre,
        apellidoCliente: usuarios.apellido,
        dniCliente: usuarios.dni,
        unidadReservada: {
            patente: unidadesVehiculos.patente,
            marca: modelosVehiculos.marca,
            modelo: modelosVehiculos.modelo
        }
    })
    .from(reservas)
    .leftJoin(usuarios, eq(reservas.idUsuario, usuarios.id))
    .leftJoin(unidadesVehiculos, eq(reservas.patenteUnidadReservada, unidadesVehiculos.patente))
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .where(eq(reservas.id, reservaId));

    if (!reserva) {
        throw error(404, 'Reserva no encontrada');
    }

    // Get all available units with their model information
    const unidadesDisponibles = await db.select({
        patente: unidadesVehiculos.patente,
        marca: modelosVehiculos.marca,
        modelo: modelosVehiculos.modelo
    })
    .from(unidadesVehiculos)
    .leftJoin(modelosVehiculos, eq(unidadesVehiculos.idModelo, modelosVehiculos.id))
    .where(eq(unidadesVehiculos.estado, 'Habilitado'));

    return {
        reserva,
        unidades: unidadesDisponibles
    };
};

export const actions: Actions = {
    asignarUnidad: async ({ request }) => {
        const formData = await request.formData();
        const reservaId = parseInt(formData.get('reservaId') as string);
        const patente = formData.get('patente') as string;

        if (!reservaId || !patente) {
            return {
                type: 'error',
                data: { error: 'Datos incompletos' }
            };
        }

        try {
            // Update the reservation with the new assigned unit
            await db.update(reservas)
                .set({
                    patenteUnidadAsignada: patente,
                    estado: 'Entregada'
                })
                .where(eq(reservas.id, reservaId));

            return {
                type: 'success'
            };
        } catch (err) {
            return {
                type: 'error',
                data: { error: 'Error al asignar la unidad' }
            };
        }
    }
}; 