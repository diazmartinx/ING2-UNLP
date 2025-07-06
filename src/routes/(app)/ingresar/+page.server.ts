import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { sendOtpEmail } from '$lib/server/resend';

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
        // Si el usuario ya está logueado, ver si hay un redirectTo
        const redirectTo = event.url.searchParams.get('redirectTo');
        if (redirectTo) {
            return redirect(302, redirectTo);
        }
        return redirect(302, '/');
    }
    
    // Obtener el mensaje de error desde los parámetros de la URL
    const error = event.url.searchParams.get('error');
    
    return {
        user: event.locals.user || null, // Pasa el usuario actual al frontend
        error: error || null // Pasa el mensaje de error si existe
    };
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const emailAddress = formData.get('email') as string;
        const password = formData.get('password') as string;
        const redirectTo = formData.get('redirectTo') as string || '/admin';
		
        if (!validateEmailAddress(emailAddress)) {
            return fail(400, {
                message: 'Credenciales inválidas'
            });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Credenciales inválidas' });
        }

        const [userWithEmail] = await db
            .select()
            .from(table.usuarios)
            .where(eq(table.usuarios.email, emailAddress));

        if (!userWithEmail) {
            return fail(400, { message: 'Credenciales inválidas' });
        }

        const validPassword = await verify(userWithEmail.passwordHash, password);

        if (!validPassword) {
            return fail(400, { message: 'Credenciales inválidas' });
        }

        if (userWithEmail.rol == 'admin') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(4, '0');
            await db.update(table.usuarios).set({ otp }).where(eq(table.usuarios.email, emailAddress));
            console.log('OTP generated:', otp);
            await sendOtpEmail(emailAddress, Number(otp));
            return redirect(302, '/ingresar/otp?email=' + userWithEmail.email);
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, userWithEmail.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        console.log('Redirecting to (hacia el pago desde logIn):', redirectTo);
        throw redirect(302, redirectTo);
    }
};

