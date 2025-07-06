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

    const { session, user, error } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
		
		// Si hay un error específico (usuario inactivo), redirigir con el mensaje
		if (error) {
			const redirectUrl = new URL('/ingresar', event.url);
			redirectUrl.searchParams.set('error', error);
			redirect(302, redirectUrl.toString());
		}
		
		// Solo redirigir normalmente si no hay error específico
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