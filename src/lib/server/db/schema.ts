import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

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
	rol: text({ enum: ["admin", "empleado", "cliente"] }).default('cliente'),
	estado: text({ enum: ["activo", "inactivo"] }).default('activo')
});

export const categoriasVehiculos = sqliteTable ('categorias_vehiculos', {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull().unique()
})

export const unidadesVehiculos = sqliteTable('unidades_vehiculos', {
	patente: text().primaryKey(),
	idSucursal: text().notNull().references(() => sucursales.id),
	idModelo: integer().references(() => modelosVehiculos.id),
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
	idCategoria: integer().references(() => categoriasVehiculos.id, { onDelete: 'set null' }),
	idPoliticaCancelacion: integer().notNull().references(() => politicasCancelacion.id),
	marca: text().notNull(),
	modelo: text().notNull(),
	capacidadPasajeros: integer().notNull(),
	precioPorDia: real().notNull(),
	porcentajeReembolsoParcial: real(),
	imagenBlob: blob('imagen_blob')
})

export const reservas = sqliteTable('reservas', {
	id: integer().primaryKey({ autoIncrement: true }),
	idUsuario: integer().notNull().references(() => usuarios.id),
	idModeloReservado: integer().notNull().references(() => modelosVehiculos.id),
	idSucursal: integer().notNull().references(() => sucursales.id),
	patenteUnidadAsignada: text().references(() => unidadesVehiculos.patente),
	fechaInicio: integer({ mode: 'timestamp' }).notNull(),
	fechaFin: integer({ mode: 'timestamp' }).notNull(),
	estado: text({ enum: ["Pendiente", "Entregada", "Cancelada", "Devuelto"] }).default('Pendiente').notNull(),
	importeTotal: real().notNull(),
	fechaCreacion: integer({ mode: 'timestamp' }).notNull(), 
	fechaDevolucion: integer({ mode: 'timestamp' }),
	importeAdicionales: real().default(0)
})

export const adicionales = sqliteTable('adicionales', {
	id: integer().primaryKey({ autoIncrement: true }),
	nombre: text().notNull(),
	precioPorDia: real().notNull(), 
	eliminado: integer().notNull().default(0), // no me deja usar booleano qsy
})

export const reservasAdicionales = sqliteTable('reservas_adicionales', {
	id: integer().primaryKey({ autoIncrement: true }),
	idReserva: integer().notNull().references(() => reservas.id),
	idAdicional: integer().notNull().references(() => adicionales.id),
})

export type Reserva = typeof reservas.$inferSelect;
export type NewReserva = typeof reservas.$inferInsert;


export const session = sqliteTable('session', {
	id: text().primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof usuarios.$inferSelect;
