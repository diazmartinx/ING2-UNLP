PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_modelos_vehiculos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idCategoria` integer,
	`idPoliticaCancelacion` integer NOT NULL,
	`marca` text NOT NULL,
	`modelo` text NOT NULL,
	`capacidadPasajeros` integer NOT NULL,
	`precioPorDia` real NOT NULL,
	`porcentajeReembolsoParcial` real,
	`imagen_blob` blob,
	FOREIGN KEY (`idCategoria`) REFERENCES `categorias_vehiculos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idPoliticaCancelacion`) REFERENCES `politicas_cancelacion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_modelos_vehiculos`("id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_blob") SELECT "id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_blob" FROM `modelos_vehiculos`;--> statement-breakpoint
DROP TABLE `modelos_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_modelos_vehiculos` RENAME TO `modelos_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_reservas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idUsuario` integer NOT NULL,
	`idModeloReservado` integer NOT NULL,
	`patenteUnidadAsignada` text,
	`fechaInicio` integer NOT NULL,
	`fechaFin` integer NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`importeTotal` real NOT NULL,
	`fechaCreacion` integer NOT NULL,
	FOREIGN KEY (`idUsuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idModeloReservado`) REFERENCES `modelos_vehiculos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patenteUnidadAsignada`) REFERENCES `unidades_vehiculos`(`patente`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reservas`("id", "idUsuario", "idModeloReservado", "patenteUnidadAsignada", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion") SELECT "id", "idUsuario", "idModeloReservado", "patenteUnidadAsignada", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion" FROM `reservas`;--> statement-breakpoint
DROP TABLE `reservas`;--> statement-breakpoint
ALTER TABLE `__new_reservas` RENAME TO `reservas`;