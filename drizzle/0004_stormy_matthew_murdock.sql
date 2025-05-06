ALTER TABLE `categoria` RENAME TO `categorias_vehiculos`;--> statement-breakpoint
ALTER TABLE `user` RENAME TO `usuarios`;--> statement-breakpoint
CREATE TABLE `modelos_vehiculos` (
	`id` text PRIMARY KEY NOT NULL,
	`id_categoria` integer NOT NULL,
	`id_politica_cancelacion` text NOT NULL,
	`marca` text NOT NULL,
	`modelo` text NOT NULL,
	`anio` integer NOT NULL,
	`capacidad_pasajeros` integer NOT NULL,
	`precio_por_dia` real NOT NULL,
	`porcentaje_reembolso_parcial` real NOT NULL,
	`imagen_url` text NOT NULL,
	FOREIGN KEY (`id_categoria`) REFERENCES `categorias_vehiculos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_politica_cancelacion`) REFERENCES `politicas_cancelacion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `categoria_nombre_unique`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categorias_vehiculos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categorias_vehiculos`("id", "nombre") SELECT "id", "nombre" FROM `categorias_vehiculos`;--> statement-breakpoint
DROP TABLE `categorias_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_categorias_vehiculos` RENAME TO `categorias_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_vehiculos_nombre_unique` ON `categorias_vehiculos` (`nombre`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at") SELECT "id", "user_id", "expires_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
ALTER TABLE `unidades` ADD `id_sucursal` text NOT NULL REFERENCES sucursales(id);