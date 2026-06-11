import { getMembership, PublicActionError, requireTeamRole } from "@/lib/auth/serverAuth";
import { getPrisma } from "@/lib/db/prisma";

type PlayerRow = { id: string; ownerId?: string | null; teamId?: string | null };

export type DbPlayerInput = {
  teamId?: string | null;
  name: string;
  kana?: string;
  number?: string;
  throwingHand?: string;
  battingSide?: string;
  primaryPosition?: string;
  memo?: string;
  sourceLocalId?: string;
};

const includePlayer = { team: true, battingRecords: true, pitchingRecords: true };

async function canEditPlayer(player: { ownerId?: string | null; teamId?: string | null } | null, userId: string) {
  if (!player) throw new PublicActionError("選手が見つかりません。");
  if (player.ownerId === userId) return true;
  if (!player.teamId) return false;
  const role = (await getMembership(player.teamId, userId))?.role;
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

export async function listPlayersForUser(userId: string) {
  const prisma = await getPrisma();
  return prisma.player.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { team: { members: { some: { userId, status: "ACTIVE" } } } },
      ],
    },
    orderBy: { name: "asc" },
    include: includePlayer,
  });
}

export async function listPlayersForTeam(teamId: string, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN", "EDITOR", "SCORER", "VIEWER"]);
  const prisma = await getPrisma();
  return prisma.player.findMany({ where: { teamId }, orderBy: { number: "asc" }, include: includePlayer });
}

export async function getPlayerForUser(playerId: string, userId: string) {
  const prisma = await getPrisma();
  const player = await prisma.player.findUnique({ where: { id: playerId }, include: includePlayer }) as PlayerRow & Record<string, unknown> | null;
  if (!player) throw new PublicActionError("選手が見つかりません。");
  if (player.ownerId !== userId && player.teamId && !(await getMembership(player.teamId, userId))) {
    throw new PublicActionError("この選手を表示する権限がありません。");
  }
  return player;
}

export async function createPlayerForUser(input: DbPlayerInput, userId: string) {
  if (input.teamId) await requireTeamRole(input.teamId, userId, ["OWNER", "ADMIN", "EDITOR"]);
  const prisma = await getPrisma();
  if (input.sourceLocalId) {
    const existing = await prisma.player.findFirst({
      where: input.teamId ? { teamId: input.teamId, sourceLocalId: input.sourceLocalId } : { ownerId: userId, sourceLocalId: input.sourceLocalId },
      include: includePlayer,
    });
    if (existing) return existing;
  }
  return prisma.player.create({
    data: {
      ...input,
      ownerId: userId,
      throws: input.throwingHand,
      bats: input.battingSide,
      primaryPos: input.primaryPosition,
      visibility: "PRIVATE",
    },
    include: includePlayer,
  });
}

export async function updatePlayerForUser(playerId: string, input: DbPlayerInput, userId: string) {
  const prisma = await getPrisma();
  const current = await prisma.player.findUnique({ where: { id: playerId } }) as PlayerRow | null;
  if (!(await canEditPlayer(current, userId))) throw new PublicActionError("この選手を編集する権限がありません。");
  if (input.teamId) await requireTeamRole(input.teamId, userId, ["OWNER", "ADMIN", "EDITOR"]);
  return prisma.player.update({
    where: { id: playerId },
    data: {
      ...input,
      throws: input.throwingHand,
      bats: input.battingSide,
      primaryPos: input.primaryPosition,
    },
    include: includePlayer,
  });
}

export async function deletePlayerForUser(playerId: string, userId: string) {
  const prisma = await getPrisma();
  const current = await prisma.player.findUnique({ where: { id: playerId } }) as PlayerRow | null;
  if (!(await canEditPlayer(current, userId))) throw new PublicActionError("この選手を削除する権限がありません。");
  return prisma.player.delete({ where: { id: playerId } });
}

export const getPlayers = listPlayersForUser;
export const getPlayersByTeam = listPlayersForTeam;
export const getPlayerById = getPlayerForUser;
export const createPlayer = createPlayerForUser;
export const updatePlayer = updatePlayerForUser;
export const deletePlayer = deletePlayerForUser;
