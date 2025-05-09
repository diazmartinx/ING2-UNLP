import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, '/');
    }
    return {
        user: event.locals.user || null // Pasa el usuario actual al frontend
    };
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const emailAddress = formData.get('email') as string;
        const password = formData.get('password') as string;
		

        if (!validateEmailAddress(emailAddress)) {
            return fail(400, {
                message: 'Correo electrónico inválido'
            });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        const results = await db.select().from(table.usuarios).where(eq(table.usuarios.email, emailAddress));
        const existingUser = results.at(0);

        if (!existingUser) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        // Ensure existingUser is defined before accessing its properties
        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });
        if (!validPassword) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        // Redirect based on user role
        if (existingUser.rol === 'admin') {
            return redirect(302, '/admin');
        }
        return redirect(302, '/');
    },
    register: async (event) => {
        const formData = await event.request.formData();
        const emailAddress = formData.get('emailAddress');
        const password = formData.get('password');

        if (!validateEmailAddress(emailAddress)) {
            return fail(400, { message: 'Correo electrónico inválido' });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Contraseña invalida' });
        }

        const userId = crypto.getRandomValues(new Uint32Array(1))[0]; // Generate a numeric ID
        const passwordHash = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        try {
            await db.insert(table.usuarios).values({ id: userId, email: emailAddress, passwordHash });

            const sessionToken = auth.generateSessionToken();
            const session = await auth.createSession(sessionToken, userId);
            auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        } catch (e) {
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/');
    }
};

function generateUserId() {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}

function validateEmailAddress(email: unknown): email is string {
    if (typeof email !== 'string') {
        return false;
    }
    email = email.trim(); // Elimina espacios en blanco al inicio y al final
    return (
        email.length >= 5 &&
        email.length <= 255 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
}

function validatePassword(password: unknown): password is string {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
