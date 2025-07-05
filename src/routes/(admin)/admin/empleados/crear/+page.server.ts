import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sendNewUserEmail } from '$lib/server/resend';
import { usuarios } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    crear: async ({ request }) => {
		const data = await request.formData();
		const nombre = data.get('nombre') as string;
		const apellido = data.get('apellido') as string;
		const dni = data.get('dni') as string;
		const email = data.get('email') as string;

		if (!nombre || !apellido || !dni || !email) {
			return fail(400, { error: 'Todos los campos son requeridos' });
		}

		// Validar formato del DNI
		if (!/^\d{7,8}$/.test(dni.trim())) {
			return fail(400, { error: 'El DNI debe tener 7 u 8 dígitos' });
		}

		// Validar formato del email
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			return fail(400, { error: 'Ingresa un correo electrónico válido' });
		}

		// verificar si el email ya existe (case-insensitive)
		const emailExistente = await db.select().from(usuarios).where(sql`LOWER(${usuarios.email}) = LOWER(${email})`);
		if (emailExistente.length > 0) {
			return fail(400, { error: 'El correo electrónico ya está registrado' });
		}

		// verificar si el DNI ya existe
		const dniExistente = await db.select().from(usuarios).where(eq(usuarios.dni, dni));
		if (dniExistente.length > 0) {
			return fail(400, { error: 'El DNI ya está registrado' });
		}

		// generar contraseña de 6 caracteres y enviar por correo
		const password = Math.random().toString(36).substring(2, 8);
		await sendNewUserEmail(email, nombre, password);
		console.log('Email enviado:', email);
		console.log('Contraseña enviada por correo:', password);

		// hashear contraseña
		const passwordHash = await hash(password);

		// crear empleado
		const crearEmpleado = await db.insert(usuarios).values({
			nombre, apellido, dni, email, passwordHash, rol: 'empleado' })
			
		if (!crearEmpleado || crearEmpleado.rowsAffected === 0) {
			return fail(400, { error: 'Error al crear el empleado' });
		}

		return { success: true, message: 'Empleado creado exitosamente' };
		
	}
}