/*
  Warnings:

  - You are about to drop the column `parentId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the `_PostToTopic` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Topic` DROP FOREIGN KEY `Topic_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoryToTopic` DROP FOREIGN KEY `_CategoryToTopic_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoryToTopic` DROP FOREIGN KEY `_CategoryToTopic_B_fkey`;

-- DropForeignKey
ALTER TABLE `_PostToTopic` DROP FOREIGN KEY `_PostToTopic_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PostToTopic` DROP FOREIGN KEY `_PostToTopic_B_fkey`;

-- DropIndex
DROP INDEX `Category_name_key` ON `Category`;

-- AlterTable
ALTER TABLE `Category` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Post` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Topic` DROP COLUMN `parentId`,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `name` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_PostToTopic`;

-- CreateTable
CREATE TABLE `TopicPostTree` (
    `id` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TopicPostTree_topicId_idx`(`topicId`),
    INDEX `TopicPostTree_postId_idx`(`postId`),
    INDEX `TopicPostTree_parentId_idx`(`parentId`),
    UNIQUE INDEX `TopicPostTree_topicId_postId_key`(`topicId`, `postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameIndex
ALTER TABLE `Post` RENAME INDEX `Post_authorId_fkey` TO `Post_authorId_idx`;
