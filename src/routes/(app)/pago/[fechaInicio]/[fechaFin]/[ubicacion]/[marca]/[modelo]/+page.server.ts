import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { reservas, modelosVehiculos, unidadesVehiculos } from '$lib/server/db/schema';
import type { NewReserva } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';

let tarjetas = [
    {
        numero: '0000-0000-0000-0000',
        nombre: 'Juan Perez',
        fechaVencimiento: '03/27',
        cvv: '123',
        state: false,
        mensaje: 'La tarjeta no es valida'
    },
    {
        numero: '1111-1111-1111-1111',
        nombre: 'Juan Perez',
        fechaVencimiento: '03/27',
        cvv: '123',
        state: true,
        mensaje: 'Reserva exitosa'
    },
    {
        numero: '2222-2222-2222-2222',
        nombre: 'Juan Perez',
        fechaVencimiento: '03/27',
        cvv: '123',
        state: false,
        mensaje: 'Fallo en la conexion con el servidor del banco'
    },
    {
        numero: '3333-3333-3333-3333',
        nombre: 'Juan Perez',
        fechaVencimiento: '03/27',
        cvv: '123',
        state: false,
        mensaje: 'Saldo insuficiente'
    }
];

export const load: PageServerLoad = async ({ params }) => {
    const { fechaInicio, fechaFin, ubicacion, marca, modelo } = params;

    let modeloVehiculo = await db.select().from(modelosVehiculos).where(and(eq(modelosVehiculos.marca, marca), eq(modelosVehiculos.modelo, modelo)));

    if(!modeloVehiculo){
        return fail(400, {
            error: 'El modelo de vehiculo no existe',
            marca: marca || '',
            modelo: modelo || ''
        });
    }

    const diasTotales = (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24);
    const importeTotal = modeloVehiculo[0].precioPorDia * diasTotales;

    return {
        fechaInicio: fechaInicio || '',
        fechaFin: fechaFin || '',
        ubicacion: ubicacion || '',
        marca: marca || '',
        modelo: modelo || '',
        importeTotal: importeTotal
    };
};

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        const formData = await request.formData();
        
        const tarjeta = formData.get('tarjeta') as string;
        const nombre = formData.get('nombre') as string;
        const fechaVencimiento = formData.get('fechaVencimiento') as string;
        const cvv = formData.get('cvv') as string;

        const { fechaInicio, fechaFin, ubicacion, marca, modelo } = params;

        if(!fechaInicio || !fechaFin || !ubicacion || !marca || !modelo){
            return fail(400, {
                error: 'Todos los campos son obligatorios',
                fechaInicio,
                fechaFin,
                ubicacion,
                marca,
                modelo
            });
        }

        let [modeloVehiculo] = await db.select().from(modelosVehiculos).where(and(eq(modelosVehiculos.marca, marca), eq(modelosVehiculos.modelo, modelo)));

        if(!modeloVehiculo){
            return fail(400, {
                error: 'El modelo de vehiculo no existe',
                marca,
                modelo
            });
        }

        let diasTotales = (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24);
        let importeTotal = modeloVehiculo.precioPorDia * diasTotales;

        // Validaciones básicas
        if (!tarjeta || !nombre || !fechaVencimiento || !cvv) {
            return fail(400, {
                error: 'Todos los campos son obligatorios',
                tarjeta,
                nombre,
                fechaVencimiento,
                cvv
            });
        }

      

        

        // Verificar si la tarjeta existe en nuestra base de datos simulada
        const tarjetaEncontrada = tarjetas.find(t => 
            t.numero === tarjeta && 
            t.nombre.toLowerCase() === nombre.toLowerCase() &&
            t.fechaVencimiento === fechaVencimiento &&
            t.cvv === cvv
        );

        if (!tarjetaEncontrada) {
            return fail(400, {
                error: 'Los datos de la tarjeta no son válidos',
                tarjeta,
                nombre,
                fechaVencimiento,
                cvv
            });
        }

        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000));

        if(!tarjetaEncontrada.state){
            return fail(400, {
                error: tarjetaEncontrada.mensaje,
                mensaje: tarjetaEncontrada.mensaje,
                success: false,
                tarjeta,
                nombre,
                fechaVencimiento,
                cvv
            });
        }

        let unidadesDeEseModelo = await db.select().from(unidadesVehiculos).where(eq(unidadesVehiculos.idModelo, modeloVehiculo.id));

        if(unidadesDeEseModelo.length === 0){
            return fail(400, {
                error: 'No hay unidades disponibles de ese modelo',
                marca,
                modelo
            });
        }
        //Crear reserva
        const reserva: NewReserva = {
            fechaInicio: new Date(params.fechaInicio!),
            fechaFin: new Date(params.fechaFin!),
            importeTotal: importeTotal,
            fechaCreacion: new Date(),
            estado: 'Pendiente',
            idUsuario: locals.user!.id,
            patenteUnidadReservada: unidadesDeEseModelo[0].patente,
            patenteUnidadAsignada: unidadesDeEseModelo[0].patente
        }

        await db.insert(reservas).values(reserva);

        // Retornar éxito
        return {
            success: tarjetaEncontrada.state,
            mensaje: tarjetaEncontrada.mensaje,
            reserva: {
                fechaInicio: params.fechaInicio,
                fechaFin: params.fechaFin,
                ubicacion: params.ubicacion,
                vehiculo: `${params.marca} ${params.modelo}`
            }
        };
    }
};