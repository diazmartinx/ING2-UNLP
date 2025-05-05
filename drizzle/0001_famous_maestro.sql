DROP INDEX `user_username_unique`;--> statement-breakpoint
ALTER TABLE `user` ADD `nombre` text;--> statement-breakpoint
ALTER TABLE `user` ADD `apellido` text;--> statement-breakpoint
ALTER TABLE `user` ADD `dni` text;--> statement-breakpoint
ALTER TABLE `user` ADD `fechaNacimiento` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `email` text;--> statement-breakpoint
ALTER TABLE `user` ADD `telefono` text;--> statement-breakpoint
ALTER TABLE `user` ADD `rol` text DEFAULT 'cliente';--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `age`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `username`;