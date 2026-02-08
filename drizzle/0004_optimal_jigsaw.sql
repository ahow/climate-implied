ALTER TABLE `historical_projections` MODIFY COLUMN `scenario_id` int;--> statement-breakpoint
ALTER TABLE `historical_projections` ADD `p25` varchar(10);--> statement-breakpoint
ALTER TABLE `historical_projections` ADD `p75` varchar(10);--> statement-breakpoint
ALTER TABLE `historical_projections` ADD `indicator_snapshot` text;--> statement-breakpoint
ALTER TABLE `historical_projections` DROP COLUMN `temperature`;--> statement-breakpoint
ALTER TABLE `historical_projections` DROP COLUMN `probability`;