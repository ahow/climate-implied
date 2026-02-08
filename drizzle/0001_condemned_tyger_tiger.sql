CREATE TABLE `corporateCommitments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`countryId` int,
	`sector` varchar(100) NOT NULL,
	`hasSbtiTarget` int NOT NULL DEFAULT 0,
	`sbtiTargetType` varchar(100),
	`sbtiValidationDate` timestamp,
	`ca100Assessment` varchar(50),
	`baselineEmissions` decimal(15,3),
	`targetYear` int,
	`targetReduction` decimal(8,4),
	`currentProgress` decimal(8,4),
	`dataSource` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `corporateCommitments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isoCode` varchar(3) NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(100) NOT NULL,
	`incomeGroup` varchar(50),
	`population` decimal(15,0),
	`gdp` decimal(20,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_isoCode_unique` UNIQUE(`isoCode`),
	CONSTRAINT `isoCode_idx` UNIQUE(`isoCode`)
);
--> statement-breakpoint
CREATE TABLE `dataSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`url` varchar(512),
	`dataType` varchar(100) NOT NULL,
	`refreshFrequency` enum('daily','weekly','monthly','annual') NOT NULL,
	`lastRefreshed` timestamp,
	`nextRefresh` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`apiEndpoint` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataSources_id` PRIMARY KEY(`id`),
	CONSTRAINT `dataSources_name_unique` UNIQUE(`name`),
	CONSTRAINT `name_source_idx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `emissionsData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int,
	`scenarioId` int,
	`year` int NOT NULL,
	`emissions` decimal(15,3) NOT NULL,
	`isHistorical` int NOT NULL DEFAULT 0,
	`isProjected` int NOT NULL DEFAULT 0,
	`dataSource` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emissionsData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emissionsProbabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`countryId` int,
	`year` int NOT NULL,
	`p10` decimal(15,3) NOT NULL,
	`p25` decimal(15,3) NOT NULL,
	`p50` decimal(15,3) NOT NULL,
	`p75` decimal(15,3) NOT NULL,
	`p90` decimal(15,3) NOT NULL,
	`simulationRuns` int NOT NULL DEFAULT 10000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emissionsProbabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpiMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int,
	`year` int NOT NULL,
	`decarbonizationRate` decimal(8,4),
	`renewableEnergyShare` decimal(8,4),
	`carbonPricingCoverage` decimal(8,4),
	`projectedWarming` decimal(5,3),
	`fossilFuelSubsidies` decimal(15,2),
	`climateFunding` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpiMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `scenarios_code_unique` UNIQUE(`code`),
	CONSTRAINT `code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `simulationParameters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`parameterName` varchar(100) NOT NULL,
	`parameterType` varchar(50) NOT NULL,
	`meanValue` decimal(15,6) NOT NULL,
	`stdDeviation` decimal(15,6) NOT NULL,
	`minValue` decimal(15,6),
	`maxValue` decimal(15,6),
	`distributionType` varchar(50) NOT NULL DEFAULT 'normal',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulationParameters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technologyDeployment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int,
	`year` int NOT NULL,
	`technologyType` varchar(100) NOT NULL,
	`capacity` decimal(15,3),
	`capacityUnit` varchar(50) NOT NULL,
	`annualAdditions` decimal(15,3),
	`cumulativeInvestment` decimal(20,2),
	`dataSource` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technologyDeployment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `corporateCommitments` ADD CONSTRAINT `corporateCommitments_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emissionsData` ADD CONSTRAINT `emissionsData_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emissionsData` ADD CONSTRAINT `emissionsData_scenarioId_scenarios_id_fk` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emissionsProbabilities` ADD CONSTRAINT `emissionsProbabilities_scenarioId_scenarios_id_fk` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emissionsProbabilities` ADD CONSTRAINT `emissionsProbabilities_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpiMetrics` ADD CONSTRAINT `kpiMetrics_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `simulationParameters` ADD CONSTRAINT `simulationParameters_scenarioId_scenarios_id_fk` FOREIGN KEY (`scenarioId`) REFERENCES `scenarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `technologyDeployment` ADD CONSTRAINT `technologyDeployment_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `company_idx` ON `corporateCommitments` (`companyName`);--> statement-breakpoint
CREATE INDEX `sector_idx` ON `corporateCommitments` (`sector`);--> statement-breakpoint
CREATE INDEX `country_commit_idx` ON `corporateCommitments` (`countryId`);--> statement-breakpoint
CREATE INDEX `region_idx` ON `countries` (`region`);--> statement-breakpoint
CREATE INDEX `data_type_idx` ON `dataSources` (`dataType`);--> statement-breakpoint
CREATE INDEX `country_year_idx` ON `emissionsData` (`countryId`,`year`);--> statement-breakpoint
CREATE INDEX `scenario_year_idx` ON `emissionsData` (`scenarioId`,`year`);--> statement-breakpoint
CREATE INDEX `year_idx` ON `emissionsData` (`year`);--> statement-breakpoint
CREATE INDEX `scenario_year_prob_idx` ON `emissionsProbabilities` (`scenarioId`,`year`);--> statement-breakpoint
CREATE INDEX `country_scenario_idx` ON `emissionsProbabilities` (`countryId`,`scenarioId`);--> statement-breakpoint
CREATE INDEX `country_year_kpi_idx` ON `kpiMetrics` (`countryId`,`year`);--> statement-breakpoint
CREATE INDEX `year_kpi_idx` ON `kpiMetrics` (`year`);--> statement-breakpoint
CREATE INDEX `scenario_param_idx` ON `simulationParameters` (`scenarioId`,`parameterName`);--> statement-breakpoint
CREATE INDEX `country_tech_year_idx` ON `technologyDeployment` (`countryId`,`technologyType`,`year`);--> statement-breakpoint
CREATE INDEX `tech_year_idx` ON `technologyDeployment` (`technologyType`,`year`);