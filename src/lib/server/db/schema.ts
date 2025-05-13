import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const usuarios = sqliteTable('usuarios',{
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text(),
	apellido: text(),
	dni: text(),
	fechaNacimiento: integer({ mode: 'timestamp' }),
	email: text(),
	telefono: text(),
	passwordHash: text('password_hash').notNull(),
	otp: text(),
	rol: text({ enum: ["admin", "empleado", "cliente"] }).default('cliente')
});

export const categoriasVehiculos = sqliteTable ('categorias_vehiculos', {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull().unique()
})

export const unidadesVehiculos = sqliteTable('unidades_vehiculos', {
	patente: text().primaryKey(),
	idSucursal: text().notNull().references(() => sucursales.id),
	idModelo: text().references(() => modelosVehiculos.id),
	anio: integer().notNull().default(2025),
	estado: text({ enum: ["Habilitado", "Inhabilitado", "Dado de baja"] }).default('Habilitado').notNull(),
})

export const politicasCancelacion = sqliteTable('politicas_cancelacion', {
	id: integer().primaryKey({ autoIncrement: true }),
	tipoPolitica: text({ enum: ["Reembolso Total", "Reembolso Parcial", "Sin Reembolso"]}).unique().notNull()
})

export const sucursales = sqliteTable('sucursales', {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull().unique(),
	direccion: text()
})

export const modelosVehiculos = sqliteTable('modelos_vehiculos', {
	id: integer().primaryKey({ autoIncrement: true }),
	idCategoria: integer().notNull().references(() => categoriasVehiculos.id),
	idPoliticaCancelacion: integer().notNull().references(() => politicasCancelacion.id),
	marca: text().notNull(),
	modelo: text().notNull(),
	capacidadPasajeros: integer().notNull(),
	precioPorDia: real().notNull(),
	porcentajeReembolsoParcial: real(),
	imagenUrl: text('imagen_url').notNull()
})

export const reservas = sqliteTable('reservas', {
	id: integer().primaryKey({ autoIncrement: true }),
	idUsuario: integer().notNull().references(() => usuarios.id),
	patenteUnidadReservada: text().notNull().references(() => unidadesVehiculos.patente),
	patenteUnidadAsignada: text().notNull().references(() => unidadesVehiculos.patente),
	fechaInicio: integer({ mode: 'timestamp' }).notNull(),
	fechaFin: integer({ mode: 'timestamp' }).notNull(),
	estado: text({ enum: ["Pendiente", "Entregada", "Cancelada"] }).default('Pendiente').notNull(),
	importeTotal: real().notNull(),
	fechaCreacion: integer({ mode: 'timestamp' }).notNull()
})


export const session = sqliteTable('session', {
	id: text().primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof usuarios.$inferSelect;
