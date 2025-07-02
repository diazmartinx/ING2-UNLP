import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		if (event.url.pathname.startsWith('/admin')) {
			redirect(302, '/ingresar');
		}

		return resolve(event);
	}

    const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
		if (event.url.pathname.startsWith('/admin')) {
			redirect(302, '/ingresar');
		}
	}

    event.locals.user = user;
    event.locals.session = session;

    // Restricciones de acceso basadas en roles
    if (user) {
        const path = event.url.pathname;
        const restrictedPaths = [
            '/admin/categorias',
            '/admin/clientes',
            '/admin/empleados',
            '/admin/modelos',
            '/admin/vehiculos'
        ];
        
        const clientRestrictedPaths = [
            ...restrictedPaths,
            '/admin/reservas',
            '/admin/reservas-historicas'
        ];

        // Si es cliente, no puede acceder a las rutas restringidas para clientes
        if (user.rol === 'cliente' && clientRestrictedPaths.some(p => path.startsWith(p))) {
            redirect(302, '/admin/mis-reservas');
        }

        // Si es empleado, no puede acceder a las rutas restringidas generales
        if (user.rol === 'empleado' && restrictedPaths.some(p => path === p)) {
            redirect(302, '/admin');
        }
    }

    return resolve(event);
};

export const handle: Handle = handleAuth;