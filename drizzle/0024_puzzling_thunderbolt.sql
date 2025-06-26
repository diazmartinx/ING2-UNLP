PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reservas_adicionales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idReserva` integer NOT NULL,
	`idAdicional` integer NOT NULL,
	FOREIGN KEY (`idReserva`) REFERENCES `reservas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idAdicional`) REFERENCES `adicionales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reservas_adicionales`("id", "idReserva", "idAdicional") SELECT "id", "idReserva", "idAdicional" FROM `reservas_adicionales`;--> statement-breakpoint
DROP TABLE `reservas_adicionales`;--> statement-breakpoint
ALTER TABLE `__new_reservas_adicionales` RENAME TO `reservas_adicionales`;--> statement-breakpoint
PRAGMA foreign_keys=ON;