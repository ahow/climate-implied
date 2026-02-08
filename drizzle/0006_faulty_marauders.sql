CREATE TABLE `projection_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cache_key` varchar(255) NOT NULL,
	`year` int NOT NULL,
	`region` varchar(50) NOT NULL,
	`category` varchar(50) NOT NULL,
	`indicator_hash` varchar(64) NOT NULL,
	`temperature_rise` decimal(5,2) NOT NULL,
	`reduction_rate` decimal(8,4) NOT NULL,
	`net_zero_year` int,
	`distribution_data` text NOT NULL,
	`trajectory_data` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projection_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `projection_cache_cache_key_unique` UNIQUE(`cache_key`),
	CONSTRAINT `cache_key_idx` UNIQUE(`cache_key`)
);
--> statement-breakpoint
CREATE INDEX `year_region_idx` ON `projection_cache` (`year`,`region`);--> statement-breakpoint
CREATE INDEX `indicator_hash_idx` ON `projection_cache` (`indicator_hash`);