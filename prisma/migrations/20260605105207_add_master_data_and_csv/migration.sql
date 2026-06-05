/*
  Warnings:

  - Added the required column `updatedAt` to the `GameNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExportSnapshot" ADD COLUMN "fileName" TEXT;

-- AlterTable
ALTER TABLE "InningScore" ADD COLUMN "errors" INTEGER;
ALTER TABLE "InningScore" ADD COLUMN "hits" INTEGER;
ALTER TABLE "InningScore" ADD COLUMN "leftOnBase" INTEGER;
ALTER TABLE "InningScore" ADD COLUMN "runs" INTEGER;
ALTER TABLE "InningScore" ADD COLUMN "topBottom" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "battingSide" TEXT;
ALTER TABLE "Player" ADD COLUMN "kana" TEXT;
ALTER TABLE "Player" ADD COLUMN "memo" TEXT;
ALTER TABLE "Player" ADD COLUMN "primaryPosition" TEXT;
ALTER TABLE "Player" ADD COLUMN "throwingHand" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "displayName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "ownerId" TEXT,
    "mode" TEXT NOT NULL,
    "gameDate" DATETIME NOT NULL,
    "venue" TEXT,
    "competition" TEXT,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "homeTeamName" TEXT NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "favoriteTeamName" TEXT,
    "weather" TEXT,
    "seatMemo" TEXT,
    "watchMemo" TEXT,
    "impressivePlayer" TEXT,
    "mvp" TEXT,
    "result" TEXT,
    "photoMemo" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "umpireMemo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "statusReason" TEXT,
    "calledReason" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("awayTeamName", "calledReason", "competition", "createdAt", "endTime", "favoriteTeamName", "gameDate", "homeTeamName", "id", "impressivePlayer", "isPublic", "mode", "mvp", "photoMemo", "result", "seatMemo", "startTime", "status", "statusReason", "umpireMemo", "updatedAt", "userId", "venue", "watchMemo", "weather") SELECT "awayTeamName", "calledReason", "competition", "createdAt", "endTime", "favoriteTeamName", "gameDate", "homeTeamName", "id", "impressivePlayer", "isPublic", "mode", "mvp", "photoMemo", "result", "seatMemo", "startTime", "status", "statusReason", "umpireMemo", "updatedAt", "userId", "venue", "watchMemo", "weather" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE INDEX "Game_gameDate_idx" ON "Game"("gameDate");
CREATE INDEX "Game_mode_idx" ON "Game"("mode");
CREATE INDEX "Game_status_idx" ON "Game"("status");
CREATE TABLE "new_GameNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "title" TEXT,
    "noteType" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameNote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameNote" ("body", "createdAt", "gameId", "id", "noteType") SELECT "body", "createdAt", "gameId", "id", "noteType" FROM "GameNote";
DROP TABLE "GameNote";
ALTER TABLE "new_GameNote" RENAME TO "GameNote";
CREATE TABLE "new_LineupEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT,
    "teamSide" TEXT NOT NULL,
    "battingOrder" INTEGER,
    "playerName" TEXT NOT NULL,
    "position" TEXT,
    "number" TEXT,
    "uniformNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STARTER',
    "isStarter" BOOLEAN NOT NULL DEFAULT true,
    "substitution" TEXT,
    "memo" TEXT,
    CONSTRAINT "LineupEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LineupEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LineupEntry" ("battingOrder", "gameId", "id", "number", "playerId", "playerName", "position", "role", "substitution", "teamSide") SELECT "battingOrder", "gameId", "id", "number", "playerId", "playerName", "position", "role", "substitution", "teamSide" FROM "LineupEntry";
DROP TABLE "LineupEntry";
ALTER TABLE "new_LineupEntry" RENAME TO "LineupEntry";
CREATE INDEX "LineupEntry_gameId_teamSide_battingOrder_idx" ON "LineupEntry"("gameId", "teamSide", "battingOrder");
CREATE TABLE "new_PitchEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateAppearanceId" TEXT NOT NULL,
    "pitchNumber" INTEGER NOT NULL,
    "pitchCall" TEXT NOT NULL,
    "speedKmh" INTEGER,
    "pitchType" TEXT,
    "course" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PitchEvent_plateAppearanceId_fkey" FOREIGN KEY ("plateAppearanceId") REFERENCES "PlateAppearance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PitchEvent" ("course", "id", "memo", "pitchCall", "pitchNumber", "pitchType", "plateAppearanceId", "speedKmh") SELECT "course", "id", "memo", "pitchCall", "pitchNumber", "pitchType", "plateAppearanceId", "speedKmh" FROM "PitchEvent";
DROP TABLE "PitchEvent";
ALTER TABLE "new_PitchEvent" RENAME TO "PitchEvent";
CREATE UNIQUE INDEX "PitchEvent_plateAppearanceId_pitchNumber_key" ON "PitchEvent"("plateAppearanceId", "pitchNumber");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "category" TEXT,
    "homeGround" TEXT,
    "primaryColor" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "id", "name", "shortName", "updatedAt", "userId") SELECT "createdAt", "id", "name", "shortName", "updatedAt", "userId" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE INDEX "Team_name_idx" ON "Team"("name");
CREATE INDEX "Team_category_idx" ON "Team"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
