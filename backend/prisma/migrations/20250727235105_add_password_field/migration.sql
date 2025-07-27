/*
  Warnings:

  - You are about to drop the column `status` on the `Capsule` table. All the data in the column will be lost.
  - The primary key for the `Trigger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `CapsuleRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consensus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConsensusMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[capsuleId]` on the table `Trigger` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Trigger` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Trigger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CapsuleRecipient" DROP CONSTRAINT "CapsuleRecipient_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleRecipient" DROP CONSTRAINT "CapsuleRecipient_userId_fkey";

-- DropForeignKey
ALTER TABLE "Consensus" DROP CONSTRAINT "Consensus_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "ConsensusMember" DROP CONSTRAINT "ConsensusMember_consensusId_fkey";

-- DropForeignKey
ALTER TABLE "ConsensusMember" DROP CONSTRAINT "ConsensusMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trigger" DROP CONSTRAINT "Trigger_capsuleId_fkey";

-- AlterTable
ALTER TABLE "Capsule" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Trigger" DROP CONSTRAINT "Trigger_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ADD CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "CapsuleRecipient";

-- DropTable
DROP TABLE "Consensus";

-- DropTable
DROP TABLE "ConsensusMember";

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_capsuleId_key" ON "Trigger"("capsuleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
