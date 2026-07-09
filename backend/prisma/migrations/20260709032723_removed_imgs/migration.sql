/*
  Warnings:

  - You are about to drop the column `imgId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imgId` on the `Likes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "imgId";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "Likes" DROP COLUMN "imgId";
