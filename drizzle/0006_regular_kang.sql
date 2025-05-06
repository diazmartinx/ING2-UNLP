ALTER TABLE `unidades_vehiculos` ADD `estado` text DEFAULT 'Habilitado' NOT NULL;--> statement-breakpoint
ALTER TABLE `unidades_vehiculos` DROP COLUMN `disponibilidad`;