/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `bio` VARCHAR(191) NULL,
    ADD COLUMN `hobbies` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;
