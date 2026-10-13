CREATE TABLE `commitments` (
	`reflection_id` integer NOT NULL,
	`action` text NOT NULL,
	PRIMARY KEY(`reflection_id`, `action`),
	FOREIGN KEY (`reflection_id`) REFERENCES `reflections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`reflection_id` integer NOT NULL,
	`lens` text NOT NULL,
	`text` text NOT NULL,
	PRIMARY KEY(`reflection_id`, `lens`),
	FOREIGN KEY (`reflection_id`) REFERENCES `reflections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reflections` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`reflection_id` integer NOT NULL,
	`statement` text NOT NULL,
	`score` integer NOT NULL,
	PRIMARY KEY(`reflection_id`, `statement`),
	FOREIGN KEY (`reflection_id`) REFERENCES `reflections`(`id`) ON UPDATE no action ON DELETE cascade
);
