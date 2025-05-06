ALTER TABLE `unidades_vehiculos` RENAME COLUMN "id_sucursal" TO "idSucursal";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_modelos_vehiculos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idCategoria` integer NOT NULL,
	`idPoliticaCancelacion` integer NOT NULL,
	`marca` text NOT NULL,
	`modelo` text NOT NULL,
	`anio` integer NOT NULL,
	`capacidadPasajeros` integer NOT NULL,
	`precioPorDia` real NOT NULL,
	`porcentajeReembolsoParcial` real,
	`imagen_url` text NOT NULL,
	FOREIGN KEY (`idCategoria`) REFERENCES `categorias_vehiculos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idPoliticaCancelacion`) REFERENCES `politicas_cancelacion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_modelos_vehiculos`("id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "anio", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_url") SELECT "id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "anio", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_url" FROM `modelos_vehiculos`;--> statement-breakpoint
DROP TABLE `modelos_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_modelos_vehiculos` RENAME TO `modelos_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_politicas_cancelacion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipoPolitica` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_politicas_cancelacion`("id", "tipoPolitica") SELECT "id", "tipoPolitica" FROM `politicas_cancelacion`;--> statement-breakpoint
DROP TABLE `politicas_cancelacion`;--> statement-breakpoint
ALTER TABLE `__new_politicas_cancelacion` RENAME TO `politicas_cancelacion`;--> statement-breakpoint
CREATE UNIQUE INDEX `politicas_cancelacion_tipoPolitica_unique` ON `politicas_cancelacion` (`tipoPolitica`);--> statement-breakpoint
CREATE TABLE `__new_reservas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idUsuario` integer NOT NULL,
	`patenteUnidad` text NOT NULL,
	`fechaInicio` integer NOT NULL,
	`fechaFin` integer NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`importeTotal` real NOT NULL,
	`fechaCreacion` integer NOT NULL,
	FOREIGN KEY (`idUsuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patenteUnidad`) REFERENCES `unidades_vehiculos`(`patente`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reservas`("id", "idUsuario", "patenteUnidad", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion") SELECT "id", "idUsuario", "patenteUnidad", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion" FROM `reservas`;--> statement-breakpoint
DROP TABLE `reservas`;--> statement-breakpoint
ALTER TABLE `__new_reservas` RENAME TO `reservas`;--> statement-breakpoint
ALTER TABLE `unidades_vehiculos` ALTER COLUMN "idSucursal" TO "idSucursal" text NOT NULL REFERENCES sucursales(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE TABLE `__new_categorias_vehiculos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categorias_vehiculos`("id", "nombre") SELECT "id", "nombre" FROM `categorias_vehiculos`;--> statement-breakpoint
DROP TABLE `categorias_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_categorias_vehiculos` RENAME TO `categorias_vehiculos`;--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_vehiculos_nombre_unique` ON `categorias_vehiculos` (`nombre`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at") SELECT "id", "user_id", "expires_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE TABLE `__new_sucursales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text
);
--> statement-breakpoint
INSERT INTO `__new_sucursales`("id", "nombre", "direccion") SELECT "id", "nombre", "direccion" FROM `sucursales`;--> statement-breakpoint
DROP TABLE `sucursales`;--> statement-breakpoint
ALTER TABLE `__new_sucursales` RENAME TO `sucursales`;--> statement-breakpoint
CREATE UNIQUE INDEX `sucursales_nombre_unique` ON `sucursales` (`nombre`);--> statement-breakpoint
CREATE TABLE `__new_usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text,
	`apellido` text,
	`dni` text,
	`fechaNacimiento` integer,
	`email` text,
	`telefono` text,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'cliente'
);
--> statement-breakpoint
INSERT INTO `__new_usuarios`("id", "nombre", "apellido", "dni", "fechaNacimiento", "email", "telefono", "password_hash", "rol") SELECT "id", "nombre", "apellido", "dni", "fechaNacimiento", "email", "telefono", "password_hash", "rol" FROM `usuarios`;--> statement-breakpoint
DROP TABLE `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;