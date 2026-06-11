-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "throws" TEXT,
    "bats" TEXT,
    "primaryPos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "mode" TEXT NOT NULL,
    "gameDate" DATETIME NOT NULL,
    "venue" TEXT,
    "competition" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT,
    "side" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "startingPitcher" TEXT,
    "relayMemo" TEXT,
    "scoringMemo" TEXT,
    "winningPitcher" TEXT,
    "losingPitcher" TEXT,
    "savePitcher" TEXT,
    "homerunMemo" TEXT,
    CONSTRAINT "GameTeam_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineupEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT,
    "teamSide" TEXT NOT NULL,
    "battingOrder" INTEGER,
    "playerName" TEXT NOT NULL,
    "position" TEXT,
    "number" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STARTER',
    "substitution" TEXT,
    CONSTRAINT "LineupEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LineupEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InningScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "inning" INTEGER NOT NULL,
    "topRuns" INTEGER NOT NULL DEFAULT 0,
    "bottomRuns" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InningScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlateAppearance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "inning" INTEGER NOT NULL,
    "topBottom" TEXT NOT NULL,
    "battingOrder" INTEGER NOT NULL,
    "batterId" TEXT,
    "pitcherId" TEXT,
    "batterName" TEXT,
    "pitcherName" TEXT,
    "balls" INTEGER NOT NULL DEFAULT 0,
    "strikes" INTEGER NOT NULL DEFAULT 0,
    "outsBefore" INTEGER NOT NULL DEFAULT 0,
    "outsAfter" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT NOT NULL,
    "rbi" INTEGER NOT NULL DEFAULT 0,
    "runScored" BOOLEAN NOT NULL DEFAULT false,
    "baseStateBefore" TEXT,
    "baseStateAfter" TEXT,
    "hitType" TEXT,
    "hitDirection" TEXT,
    "battedBallType" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlateAppearance_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlateAppearance_batterId_fkey" FOREIGN KEY ("batterId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlateAppearance_pitcherId_fkey" FOREIGN KEY ("pitcherId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PitchEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateAppearanceId" TEXT NOT NULL,
    "pitchNumber" INTEGER NOT NULL,
    "pitchCall" TEXT NOT NULL,
    "speedKmh" INTEGER,
    "pitchType" TEXT,
    "course" TEXT,
    "memo" TEXT,
    CONSTRAINT "PitchEvent_plateAppearanceId_fkey" FOREIGN KEY ("plateAppearanceId") REFERENCES "PlateAppearance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RunnerEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateAppearanceId" TEXT NOT NULL,
    "runnerName" TEXT,
    "fromBase" TEXT,
    "toBase" TEXT,
    "outcome" TEXT NOT NULL,
    "rbiCredit" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT,
    CONSTRAINT "RunnerEvent_plateAppearanceId_fkey" FOREIGN KEY ("plateAppearanceId") REFERENCES "PlateAppearance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameNote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExportSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "gameId" TEXT,
    "type" TEXT NOT NULL,
    "style" TEXT,
    "imageUrl" TEXT,
    "dataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExportSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ExportSnapshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Game_gameDate_idx" ON "Game"("gameDate");

-- CreateIndex
CREATE INDEX "Game_mode_idx" ON "Game"("mode");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "GameTeam_gameId_idx" ON "GameTeam"("gameId");

-- CreateIndex
CREATE INDEX "GameTeam_teamName_idx" ON "GameTeam"("teamName");

-- CreateIndex
CREATE INDEX "LineupEntry_gameId_teamSide_battingOrder_idx" ON "LineupEntry"("gameId", "teamSide", "battingOrder");

-- CreateIndex
CREATE UNIQUE INDEX "InningScore_gameId_inning_key" ON "InningScore"("gameId", "inning");

-- CreateIndex
CREATE INDEX "PlateAppearance_gameId_inning_topBottom_idx" ON "PlateAppearance"("gameId", "inning", "topBottom");

-- CreateIndex
CREATE INDEX "PlateAppearance_batterId_idx" ON "PlateAppearance"("batterId");

-- CreateIndex
CREATE INDEX "PlateAppearance_pitcherId_idx" ON "PlateAppearance"("pitcherId");

-- CreateIndex
CREATE UNIQUE INDEX "PitchEvent_plateAppearanceId_pitchNumber_key" ON "PitchEvent"("plateAppearanceId", "pitchNumber");

-- CreateIndex
CREATE INDEX "ExportSnapshot_type_idx" ON "ExportSnapshot"("type");
