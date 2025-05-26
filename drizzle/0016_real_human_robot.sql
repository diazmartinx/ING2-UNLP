PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_unidades_vehiculos` (
	`patente` text PRIMARY KEY NOT NULL,
	`idSucursal` text NOT NULL,
	`idModelo` integer,
	`anio` integer DEFAULT 2025 NOT NULL,
	`estado` text DEFAULT 'Habilitado' NOT NULL,
	FOREIGN KEY (`idSucursal`) REFERENCES `sucursales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idModelo`) REFERENCES `modelos_vehiculos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_unidades_vehiculos`("patente", "idSucursal", "idModelo", "anio", "estado") SELECT "patente", "idSucursal", "idModelo", "anio", "estado" FROM `unidades_vehiculos`;--> statement-breakpoint
DROP TABLE `unidades_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_unidades_vehiculos` RENAME TO `unidades_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;