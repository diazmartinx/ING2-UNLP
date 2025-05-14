import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    verifyOtp: async (event) => {
        const formData = await event.request.formData();
        const otp = formData.get('otp') as string;
        const emailAddress = formData.get('email') as string;

        if (!otp || !emailAddress) {
            return fail(400, { message: 'OTP y correo electrónico requeridos' });
        }

        const [existingUser] = await db.select().from(table.usuarios).where(and(eq(table.usuarios.email, emailAddress), eq(table.usuarios.otp, otp)));

        if (!existingUser) {
            return fail(400, { message: 'Usuario no encontrado o OTP incorrecto' });
        }

        await db.update(table.usuarios).set({ otp: null }).where(eq(table.usuarios.email, emailAddress));

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return redirect(302, '/admin');
    }
} satisfies Actions;