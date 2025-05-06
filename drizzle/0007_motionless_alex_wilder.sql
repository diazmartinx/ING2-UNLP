DROP INDEX "categorias_vehiculos_nombre_unique";--> statement-breakpoint
DROP INDEX "politicas_cancelacion_tipo_politica_unique";--> statement-breakpoint
DROP INDEX "sucursales_nombre_unique";--> statement-breakpoint
ALTER TABLE `modelos_vehiculos` ALTER COLUMN "porcentaje_reembolso_parcial" TO "porcentaje_reembolso_parcial" real;--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_vehiculos_nombre_unique` ON `categorias_vehiculos` (`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `politicas_cancelacion_tipo_politica_unique` ON `politicas_cancelacion` (`tipo_politica`);--> statement-breakpoint
CREATE UNIQUE INDEX `sucursales_nombre_unique` ON `sucursales` (`nombre`);