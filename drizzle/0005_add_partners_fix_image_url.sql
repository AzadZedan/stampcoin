ALTER TABLE `stamps` MODIFY COLUMN `imageUrl` text NOT NULL;
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(200) NOT NULL,
	`companyNameAr` varchar(200),
	`description` text,
	`descriptionAr` text,
	`website` varchar(500),
	`logo` text,
	`logoKey` varchar(500),
	`tier` enum('bronze','silver','gold','platinum','diamond') NOT NULL,
	`totalInvestment` decimal(15,2) NOT NULL,
	`investmentDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','approved','rejected','active','inactive') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvalDate` timestamp,
	`benefits` text,
	`contactPerson` varchar(200),
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerBenefits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`benefitType` enum('discount','commission','feature','support','branding','exclusive_access') NOT NULL,
	`description` varchar(500) NOT NULL,
	`value` varchar(200),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerBenefits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`transactionId` int,
	`type` enum('purchase','commission','reward','refund') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` varchar(500),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `partnerTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partners` ADD CONSTRAINT `partners_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `partnerBenefits` ADD CONSTRAINT `partnerBenefits_partnerId_partners_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `partnerTransactions` ADD CONSTRAINT `partnerTransactions_partnerId_partners_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `partnerTransactions` ADD CONSTRAINT `partnerTransactions_transactionId_transactions_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;
