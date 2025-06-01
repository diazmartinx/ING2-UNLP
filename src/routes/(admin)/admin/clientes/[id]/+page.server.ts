import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

// Función helper para formatear fecha a YYYY-MM-DD
function formatDateForInput(date: Date | string | null): string {
	if (!date) return '';
	
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	if (isNaN(dateObj.getTime())) return '';
	
	return dateObj.toISOString().split('T')[0];
}

// Función para calcular la edad
function calculateAge(birthDate: Date): number {
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	
	return age;
}

// Función para validar que sea mayor de 18 años
function isOver18(birthDate: Date): boolean {
	return calculateAge(birthDate) >= 18;
}

// Función para validar que el año sea mayor a 1900
function isValidYear(birthDate: Date): boolean {
	return birthDate.getFullYear() >= 1900;
}

export const load: PageServerLoad = async ({ params }) => {
	const clienteDB = await db.select().from(usuarios).where(eq(usuarios.id, Number(params.id)));
	console.log('Cliente encontrado:', clienteDB);
	
	const cliente = clienteDB[0];
	
	return {
		cliente: {
			...cliente,
			fechaNacimiento: formatDateForInput(cliente?.fechaNacimiento)
		}
	};
};

export const actions: Actions = {
	guardar: async ({ request, params }) => {
		const data = await request.formData();
		const nombre = data.get('nombre')?.toString() ?? '';
		const apellido = data.get('apellido')?.toString() ?? '';
		const dni = data.get('dni')?.toString();
		const email = data.get('email')?.toString() ?? '';
		const telefono = data.get('telefono')?.toString() ?? '';
		const fechaNacimiento = data.get('fechaNacimiento')?.toString() ?? '';

        console.log('Datos recibidos:', data);

		if (!nombre || !apellido || !email || !fechaNacimiento) {
			return fail(400, { error: 'Todos los campos obligatorios deben estar completos' });
		}

		// Validar formato de fecha
		const fechaNacimientoDate = new Date(fechaNacimiento);
		if (isNaN(fechaNacimientoDate.getTime())) {
			return fail(400, { error: 'Formato de fecha inválido' });
		}

		// Validar que el año sea mayor a 1900
        // hay error en la fecha, el dìa elegido se termina guardando con un dìa menor en la DB, por eso
        // la validaciòn es a 01/01/1900 en lugar de 1900 (31/12/1899)
		if (!isValidYear(fechaNacimientoDate)) {
			return fail(400, { 
				error: 'Debe ingresar una fecha correcta. El año debe ser mayor a 01/01/1900' 
			});
		}

		// Validar que la fecha no sea futura
		if (fechaNacimientoDate > new Date()) {
			return fail(400, { error: 'La fecha de nacimiento no puede ser futura' });
		}

		// Validar que sea mayor de 18 años
		if (!isOver18(fechaNacimientoDate)) {
			return fail(400, { 
				error: `La persona debe ser mayor de 18 años.` 
			});
		}

		const id = Number(params.id);

		try {
			const updated = await db.update(usuarios).set({ nombre, apellido, dni, email, telefono, fechaNacimiento: fechaNacimientoDate }).where(eq(usuarios.id, id));
			if (updated.rowsAffected === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}
			return { success: true, message: 'Cliente actualizado exitosamente' };
		} catch (err) {
			console.error('Error al actualizar cliente:', err);
			return fail(500, { error: 'Error interno al actualizar el cliente' });
		}
	}
};