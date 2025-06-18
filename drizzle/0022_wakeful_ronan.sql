CREATE TABLE `adicionales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`cantidadMaxima` integer NOT NULL,
	`precioPorDia` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reservas_adicionales` (
	`idReserva` integer NOT NULL,
	`idAdicional` integer NOT NULL,
	`cantidad` integer NOT NULL,
	FOREIGN KEY (`idReserva`) REFERENCES `reservas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idAdicional`) REFERENCES `adicionales`(`id`) ON UPDATE no action ON DELETE no action
);
