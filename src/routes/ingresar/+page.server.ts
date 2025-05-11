import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function validateEmailAddress(email: string) {
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

function validatePassword(password: string) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}

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
		
        console.log(emailAddress, password);

        if (!validateEmailAddress(emailAddress)) {
            return fail(400, {
                message: 'Correo electrónico inválido'
            });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        const [userWithEmail] = await db
            .select()
            .from(table.usuarios)
            .where(eq(table.usuarios.email, emailAddress));

        if (!userWithEmail) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        console.log('Retrieved passwordHash from DB:', userWithEmail.passwordHash);
        const validPassword = await verify(userWithEmail.passwordHash, password);

        if (!validPassword) {
            return fail(400, { message: 'Correo electrónico o contraseña invalida' });
        }

        if (userWithEmail.rol !== 'admin') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(4, '0');
            await db.update(table.usuarios).set({ otp }).where(eq(table.usuarios.email, emailAddress));
            console.log('OTP generated:', otp);
            return redirect(302, '/ingresar/otp?email=' + userWithEmail.email);
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, userWithEmail.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return redirect(302, '/admin');
    }
};

