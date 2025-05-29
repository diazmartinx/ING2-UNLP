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
	FOREIGN KEY (`idCategoria`) REFERENCES `categorias_vehiculos`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`idPoliticaCancelacion`) REFERENCES `politicas_cancelacion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_modelos_vehiculos`("id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_blob") SELECT "id", "idCategoria", "idPoliticaCancelacion", "marca", "modelo", "capacidadPasajeros", "precioPorDia", "porcentajeReembolsoParcial", "imagen_blob" FROM `modelos_vehiculos`;--> statement-breakpoint
DROP TABLE `modelos_vehiculos`;--> statement-breakpoint
ALTER TABLE `__new_modelos_vehiculos` RENAME TO `modelos_vehiculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;