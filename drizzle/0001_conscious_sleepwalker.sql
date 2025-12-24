CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100),
	`nameDe` varchar(100),
	`nameFr` varchar(100),
	`nameEs` varchar(100),
	`nameZh` varchar(100),
	`nameKo` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(300) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','replied') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stampId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stamps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleAr` varchar(200),
	`titleDe` varchar(200),
	`titleFr` varchar(200),
	`titleEs` varchar(200),
	`titleZh` varchar(200),
	`titleKo` varchar(200),
	`description` text NOT NULL,
	`descriptionAr` text,
	`descriptionDe` text,
	`descriptionFr` text,
	`descriptionEs` text,
	`descriptionZh` text,
	`descriptionKo` text,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(500),
	`categoryId` int NOT NULL,
	`country` varchar(100),
	`year` int,
	`rarity` enum('common','uncommon','rare','very_rare','legendary') NOT NULL DEFAULT 'common',
	`price` decimal(10,2) NOT NULL,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`ownerId` int,
	`authenticatedBy` varchar(200),
	`authenticationDate` timestamp,
	`mintNumber` int,
	`totalMinted` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stamps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stampId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int,
	`price` decimal(10,2) NOT NULL,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`transactionHash` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
