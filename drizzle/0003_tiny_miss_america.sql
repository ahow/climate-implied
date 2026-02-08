CREATE TABLE `historical_projections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysis_date` timestamp NOT NULL,
	`scenario_id` int NOT NULL,
	`temperature` varchar(10) NOT NULL,
	`probability` varchar(10) NOT NULL,
	`median` varchar(10) NOT NULL,
	`p10` varchar(10) NOT NULL,
	`p90` varchar(10) NOT NULL,
	`data_source` text,
	`methodology` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historical_projections_id` PRIMARY KEY(`id`)
);
