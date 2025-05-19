
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { hash } from '@node-rs/argon2';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';
export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    registrar: async (event) => {
        const formData = await event.request.formData();
        const nombre = formData.get('nombre') as string;
        const apellido = formData.get('apellido') as string;
        const dni = formData.get('dni') as string;
        const fechaNacimiento = formData.get('fechaNacimiento') as string;
        const email = formData.get('email') as string;
        const telefono = formData.get('telefono') as string;
        const password = formData.get('password') as string;
        const passwordConfirm = formData.get('passwordConfirm') as string;
        const redirectTo = formData.get('redirectTo') as string || '/admin';
        
        if (!nombre || !apellido || !dni || !fechaNacimiento || !email || !telefono || !password || !passwordConfirm) {
            return fail(400, { error: 'Todos los campos son requeridos' });
        }

        // Check if password has at least 6 characters
        if (password.length < 6) {
            return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        if (password !== passwordConfirm) {
            return fail(400, { error: 'Las contraseñas no coinciden' });
        }

        // Check if email is already in use
        const existingUser = await db.query.usuarios.findFirst({
            where: eq(usuarios.email, email)
        });

        if (existingUser) {
            return fail(400, { error: 'El email ya está en uso' });
        }

        // check if user is at least 18 years old
        const today = new Date();
        const birthDate = new Date(fechaNacimiento);
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < 18) {
            return fail(400, { error: 'Debes tener al menos 18 años para registrarte' });
        }

        const hashedPassword = await hash(password);

        const [newUser] = await db.insert(usuarios).values({
            nombre,
            apellido,
            dni: parseInt(dni).toString(),
            fechaNacimiento: new Date(fechaNacimiento),
            email,
            telefono: parseInt(telefono).toString(),
            passwordHash: hashedPassword,
            rol: 'cliente'
        })
            .returning({ id: usuarios.id });

        if (!newUser) {
            return fail(500, { error: 'Error al crear el usuario' });
        }

        // Crear sesión automáticamente para el nuevo usuario
        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, newUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        // Redirigir al pago si hay un parámetro redirectTo
        throw redirect(302, redirectTo);
    }
} satisfies Actions;