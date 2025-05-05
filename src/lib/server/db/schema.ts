import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	nombre: text(),
	apellido: text(),
	dni: text(),
	fechaNacimiento: integer({ mode: 'timestamp' }),
	email: text(),
	telefono: text(),
	passwordHash: text('password_hash').notNull(),
	rol: text({ enum: ["admin", "empleado", "cliente"] }).default('cliente')
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const categoriaTabla = sqliteTable ('categoria', {
	id: integer().primaryKey(),
	nombre: text().notNull().unique()
})

export const unidades = sqliteTable('unidades', {
	id: text().primaryKey(),
	disponibilidad: integer({ mode: 'boolean' })
})

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
