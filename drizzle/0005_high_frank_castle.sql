ALTER TABLE `unidades` RENAME TO `unidades_vehiculos`;--> statement-breakpoint
ALTER TABLE `unidades_vehiculos` RENAME COLUMN "id" TO "patente";--> statement-breakpoint
CREATE TABLE `reservas` (
	`id` text PRIMARY KEY NOT NULL,
	`id_usuario` text NOT NULL,
	`patente_unidad` text NOT NULL,
	`fecha_inicio` integer NOT NULL,
	`fecha_fin` integer NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`importe_total` real NOT NULL,
	`fecha_creacion` integer NOT NULL,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patente_unidad`) REFERENCES `unidades_vehiculos`(`patente`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_unidades_vehiculos` (
	`patente` text PRIMARY KEY NOT NULL,
	`id_sucursal` text NOT NULL,
	`disponibilidad` integer,
	FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_unidades_vehiculos`("patente", "id_sucursal", "disponibilidad") SELECT "patente", "id_sucursal", "disponibilidad" FROM `unidades_vehiculos`;--> statement-breakpoint
DROP TABLE `unidades_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_unidades_vehiculos` RENAME TO `unidades_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;