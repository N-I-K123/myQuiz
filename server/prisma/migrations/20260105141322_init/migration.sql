/*
  Warnings:

  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `difficulty` to the `FlashCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Progress";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "deadline" DATETIME,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionFlashCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isLearned" BOOLEAN NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "collectionId" INTEGER NOT NULL,
    "flashCardId" INTEGER NOT NULL,
    CONSTRAINT "CollectionFlashCard_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionFlashCard_flashCardId_fkey" FOREIGN KEY ("flashCardId") REFERENCES "FlashCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlashCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL
);
INSERT INTO "new_FlashCard" ("answer", "id", "question") SELECT "answer", "id", "question" FROM "FlashCard";
DROP TABLE "FlashCard";
ALTER TABLE "new_FlashCard" RENAME TO "FlashCard";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_User" ("id", "password", "username") SELECT "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CollectionFlashCard_flashCardId_collectionId_key" ON "CollectionFlashCard"("flashCardId", "collectionId");
