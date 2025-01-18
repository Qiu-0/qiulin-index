/*
  Warnings:

  - You are about to drop the column `authorId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Post_authorId_idx` ON `Post`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `authorId`;

-- DropTable
DROP TABLE `User`;
