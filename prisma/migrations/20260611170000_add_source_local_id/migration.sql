-- Add nullable local-source identifiers for idempotent localStorage migration.
ALTER TABLE "Game" ADD COLUMN "sourceLocalId" TEXT;
ALTER TABLE "Team" ADD COLUMN "sourceLocalId" TEXT;
ALTER TABLE "Player" ADD COLUMN "sourceLocalId" TEXT;

CREATE INDEX "Game_ownerId_sourceLocalId_idx" ON "Game"("ownerId", "sourceLocalId");
CREATE INDEX "Team_ownerId_sourceLocalId_idx" ON "Team"("ownerId", "sourceLocalId");
CREATE INDEX "Player_ownerId_sourceLocalId_idx" ON "Player"("ownerId", "sourceLocalId");
CREATE INDEX "Player_teamId_sourceLocalId_idx" ON "Player"("teamId", "sourceLocalId");
