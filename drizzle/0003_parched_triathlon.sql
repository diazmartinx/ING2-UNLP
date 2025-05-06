CREATE TABLE `politicas_cancelacion` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo_politica` text DEFAULT 'Sin Reembolso' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `politicas_cancelacion_tipo_politica_unique` ON `politicas_cancelacion` (`tipo_politica`);--> statement-breakpoint
CREATE TABLE `sucursales` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sucursales_nombre_unique` ON `sucursales` (`nombre`);