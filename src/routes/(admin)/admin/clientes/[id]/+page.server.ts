import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { and, eq, like, ne, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

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
		const id = Number(params.id);
		const data = await request.formData();
		const nombre = data.get('nombre')?.toString().trim() ?? '';
		const apellido = data.get('apellido')?.toString().trim() ?? '';
		const dni = data.get('dni')?.toString().trim();
		const email = data.get('email')?.toString().trim() ?? '';
		const telefono = data.get('telefono')?.toString().trim() ?? '';
		const fechaNacimiento = data.get('fechaNacimiento')?.toString() ?? '';

		if (!nombre || !apellido || !email || !fechaNacimiento) {
			return fail(400, { error: 'Todos los campos obligatorios deben estar completos' });
		}

		// Validar unicidad de email
		const [existingUserByEmail] = await db
			.select()
			.from(usuarios)
			.where(and(like(sql`lower(${usuarios.email})`, email.toLowerCase()), ne(usuarios.id, id)));

		if (existingUserByEmail) {
			return fail(400, { error: 'El email ya está en uso por otro usuario' });
		}

		// Validar unicidad de DNI si se proporciona
		if (dni) {
			const [existingUserByDni] = await db
				.select()
				.from(usuarios)
				.where(and(eq(usuarios.dni, dni), ne(usuarios.id, id)));

			if (existingUserByDni) {
				return fail(400, { error: 'El DNI ya está en uso por otro usuario' });
			}
		}

		// Validar formato de fecha, agregando T00:00:00 para evitar problemas de zona horaria
		const fechaNacimientoDate = new Date(fechaNacimiento + 'T00:00:00');
		if (isNaN(fechaNacimientoDate.getTime())) {
			return fail(400, { error: 'Formato de fecha inválido' });
		}

		// Validar que el año sea mayor a 1900
		if (!isValidYear(fechaNacimientoDate)) {
			return fail(400, {
				error: 'Debe ingresar una fecha correcta. El año debe ser mayor a 1900'
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

		try {
			const updated = await db
				.update(usuarios)
				.set({ nombre, apellido, dni, email, telefono, fechaNacimiento: fechaNacimientoDate })
				.where(eq(usuarios.id, id));
			if (updated.rowsAffected === 0) {
				return fail(404, { error: 'Cliente no encontrado' });
			}
			throw redirect(302, '/admin/clientes?toast=cliente-actualizado');
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				// Es un redirect, relanzar
				throw err;
			}
			console.error('Error al actualizar cliente:', err);
			return fail(500, { error: 'Error interno al actualizar el cliente' });
		}
	}
};