import type { RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: number) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId: Number(userId),
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	// Primero verificamos si existe la sesión sin filtrar por estado
	const [sessionResult] = await db
		.select({
			user: table.usuarios,
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.usuarios, eq(table.session.userId, table.usuarios.id))
		.where(eq(table.session.id, sessionId));

	if (!sessionResult) {
		return { session: null, user: null, error: null };
	}

	// Si el usuario está inactivo, retornamos un error específico
	if (sessionResult.user.estado === 'inactivo') {
		// Invalidamos la sesión del usuario inactivo
		await db.delete(table.session).where(eq(table.session.id, sessionId));
		return { 
			session: null, 
			user: null, 
			error: 'Su cuenta ha sido dada de baja. No puede iniciar sesión.' 
		};
	}

	const { session, user } = sessionResult;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null, error: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user, error: null };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
