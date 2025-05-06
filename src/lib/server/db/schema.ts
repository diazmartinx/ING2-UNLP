import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const usuarios = sqliteTable('usuarios', {
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

export const categorias_vehiculos = sqliteTable ('categorias_vehiculos', {
	id: text().primaryKey(),
	nombre: text().notNull().unique()
})

export const unidades_vehiculos = sqliteTable('unidades_vehiculos', {
	patente: text().primaryKey(),
	id_sucursal: text().notNull().references(() => sucursales.id),
	estado: text({ enum: ["Habilitado", "Inhabilitado", "Dado de baja"] }).default('Habilitado').notNull(),
})

export const politicas_cancelacion = sqliteTable('politicas_cancelacion', {
	id: text().primaryKey(),
	tipo_politica: text({ enum: ["Reembolso Total", "Reembolso Parcial", "Sin Reembolso"]}).unique().notNull().default('Sin Reembolso')
})

export const sucursales = sqliteTable('sucursales', {
	id: text().primaryKey(),
	nombre: text().notNull().unique(),
	direccion: text()
})

export const modelos_vehiculos = sqliteTable('modelos_vehiculos', {
	id: text().primaryKey(),
	id_categoria: integer().notNull().references(() => categorias_vehiculos.id),
	id_politica_cancelacion: text().notNull().references(() => politicas_cancelacion.id),
	marca: text().notNull(),
	modelo: text().notNull(),
	anio: integer().notNull(),
	capacidad_pasajeros: integer().notNull(),
	precio_por_dia: real().notNull(),
	porcentaje_reembolso_parcial: real(),
	imagen_url: text().notNull()
})

export const reservas = sqliteTable('reservas', {
	id: text().primaryKey(),
	id_usuario: text().notNull().references(() => usuarios.id),
	patente_unidad: text().notNull().references(() => unidades_vehiculos.patente),
	fecha_inicio: integer({ mode: 'timestamp' }).notNull(),
	fecha_fin: integer({ mode: 'timestamp' }).notNull(),
	estado: text({ enum: ["Pendiente", "Entregada", "Cancelada"] }).default('Pendiente').notNull(),
	importe_total: real().notNull(),
	fecha_creacion: integer({ mode: 'timestamp' }).notNull()
})


export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => usuarios.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof usuarios.$inferSelect;
