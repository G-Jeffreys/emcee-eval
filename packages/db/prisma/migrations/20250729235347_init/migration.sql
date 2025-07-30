-- CreateTable
CREATE TABLE "battles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aiOne" TEXT NOT NULL,
    "aiTwo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "totalRounds" INTEGER NOT NULL DEFAULT 4,
    "winner" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "verses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "battleId" INTEGER NOT NULL,
    "orderIdx" INTEGER NOT NULL,
    "ai" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "audioUrl" TEXT,
    "lrcJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verses_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "battles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "verses_battleId_orderIdx_key" ON "verses"("battleId", "orderIdx");
