import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
const handleAuth: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		if (event.url.pathname.startsWith('/admin')) {
			redirect(302, '/registrarse');
		}

		return resolve(event);
	}

    const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
		if (event.url.pathname.startsWith('/admin')) {
			redirect(302, '/registrarse');
		}
	}

    event.locals.user = user;
    event.locals.session = session;
    return resolve(event);
};

export const handle: Handle = handleAuth;