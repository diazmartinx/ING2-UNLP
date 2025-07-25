PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reservas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idUsuario` integer NOT NULL,
	`idModeloReservado` integer NOT NULL,
	`idSucursal` integer NOT NULL,
	`patenteUnidadAsignada` text,
	`fechaInicio` integer NOT NULL,
	`fechaFin` integer NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`importeTotal` real NOT NULL,
	`fechaCreacion` integer NOT NULL,
	FOREIGN KEY (`idUsuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idModeloReservado`) REFERENCES `modelos_vehiculos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idSucursal`) REFERENCES `sucursales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patenteUnidadAsignada`) REFERENCES `unidades_vehiculos`(`patente`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reservas`("id", "idUsuario", "idModeloReservado", "idSucursal", "patenteUnidadAsignada", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion") SELECT "id", "idUsuario", "idModeloReservado", "idSucursal", "patenteUnidadAsignada", "fechaInicio", "fechaFin", "estado", "importeTotal", "fechaCreacion" FROM `reservas`;--> statement-breakpoint
DROP TABLE `reservas`;--> statement-breakpoint
ALTER TABLE `__new_reservas` RENAME TO `reservas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;