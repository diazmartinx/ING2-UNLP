DROP INDEX "categorias_vehiculos_nombre_unique";--> statement-breakpoint
DROP INDEX "politicas_cancelacion_tipoPolitica_unique";--> statement-breakpoint
DROP INDEX "sucursales_nombre_unique";--> statement-breakpoint
ALTER TABLE `modelos_vehiculos` ALTER COLUMN "imagen_blob" TO "imagen_blob" blob;--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_vehiculos_nombre_unique` ON `categorias_vehiculos` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `politicas_cancelacion_tipoPolitica_unique` ON `politicas_cancelacion` (`tipoPolitica`);--> statement-breakpoint
CREATE UNIQUE INDEX `sucursales_nombre_unique` ON `sucursales` (`nombre`);