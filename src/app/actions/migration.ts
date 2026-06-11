"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { getPrisma, dbErrorMessage } from "@/lib/db/prisma";
import { createGameForUser } from "@/lib/repositories/games";
import { createPlayerForUser } from "@/lib/repositories/players";
import { createTeamForUser } from "@/lib/repositories/teams";
import type { ScoreBaseGame } from "@/lib/types";

type LocalTeam = { id: string; name: string; shortName?: string; category?: string; homeGround?: string; primaryColor?: string; memo?: string };
type LocalPlayer = { id: string; teamId?: string; name: string; kana?: string; number?: string; throwingHand?: string; battingSide?: string; primaryPosition?: string; memo?: string };
type MigrationPayload = { games: ScoreBaseGame[]; teams: LocalTeam[]; players: LocalPlayer[] };
type MigrationResult = { ok: true; created: number; skipped: number; failed: number } | { ok: false; error: string };

function stableSourceId(prefix: string, input: { id?: string; createdAt?: string; name?: string }) {
  return input.id || `${prefix}:${input.createdAt || "unknown"}:${input.name || "unnamed"}`;
}

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function migrateLocalDataAction(payload: MigrationPayload): Promise<MigrationResult> {
  try {
    const user = await requireCurrentUser();
    const prisma = await getPrisma();
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const team of payload.teams) {
      try {
        const sourceLocalId = stableSourceId("team", team);
        const existing = await prisma.team.findFirst({ where: { ownerId: user.id, sourceLocalId } });
        if (existing) {
          skipped += 1;
          continue;
        }
        await createTeamForUser({ ...team, sourceLocalId }, user.id);
        created += 1;
      } catch {
        failed += 1;
      }
    }

    for (const player of payload.players) {
      try {
        const sourceLocalId = stableSourceId("player", player);
        const existing = await prisma.player.findFirst({
          where: player.teamId ? { teamId: player.teamId, sourceLocalId } : { ownerId: user.id, sourceLocalId },
        });
        if (existing) {
          skipped += 1;
          continue;
        }
        await createPlayerForUser({ ...player, teamId: player.teamId || null, sourceLocalId }, user.id);
        created += 1;
      } catch {
        failed += 1;
      }
    }

    for (const game of payload.games) {
      try {
        const sourceLocalId = stableSourceId("game", { id: game.id, createdAt: game.createdAt, name: `${game.awayTeamName}-${game.homeTeamName}` });
        const existing = await prisma.game.findFirst({ where: { ownerId: user.id, sourceLocalId } });
        if (existing) {
          skipped += 1;
          continue;
        }
        await createGameForUser({ ...game, sourceLocalId }, user.id);
        created += 1;
      } catch {
        failed += 1;
      }
    }

    revalidatePath("/games");
    revalidatePath("/teams");
    revalidatePath("/players");
    revalidatePath("/settings/data");
    return { ok: true, created, skipped, failed };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
