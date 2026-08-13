CREATE TABLE `planner_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planner_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `planner_documents_userId_unique` UNIQUE(`userId`)
);
