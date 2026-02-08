ALTER TABLE `historical_projections` MODIFY COLUMN `median` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `historical_projections` MODIFY COLUMN `p10` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `historical_projections` MODIFY COLUMN `p25` varchar(20);--> statement-breakpoint
ALTER TABLE `historical_projections` MODIFY COLUMN `p75` varchar(20);--> statement-breakpoint
ALTER TABLE `historical_projections` MODIFY COLUMN `p90` varchar(20) NOT NULL;