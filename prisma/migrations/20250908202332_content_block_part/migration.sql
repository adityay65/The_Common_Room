/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Post` DROP COLUMN `content`,
    DROP COLUMN `imageUrl`,
    ADD COLUMN `coverImageUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ContentBlock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` INTEGER NOT NULL,
    `type` ENUM('HEADING_ONE', 'HEADING_TWO', 'PARAGRAPH', 'IMAGE', 'CODE', 'LIST_ITEM') NOT NULL,
    `data` JSON NOT NULL,
    `postId` INTEGER NOT NULL,

    UNIQUE INDEX `ContentBlock_postId_order_key`(`postId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContentBlock` ADD CONSTRAINT `ContentBlock_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
