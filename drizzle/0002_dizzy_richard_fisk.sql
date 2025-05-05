CREATE TABLE `categoria` (
	`id` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categoria_nombre_unique` ON `categoria` (`nombre`);--> statement-breakpoint
CREATE TABLE `unidades` (
	`id` text PRIMARY KEY NOT NULL,
	`disponibilidad` integer
);
