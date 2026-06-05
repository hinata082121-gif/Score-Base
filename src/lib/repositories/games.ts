import { getPrisma } from "@/lib/db/prisma";

export async function getGames() {
  const prisma = await getPrisma();
  return prisma.game.findMany({ orderBy: { gameDate: "desc" }, include: { inningScores: true, plateAppearances: true, lineups: true } });
}

export async function getGameById(id: string) {
  const prisma = await getPrisma();
  return prisma.game.findUnique({ where: { id }, include: { inningScores: true, plateAppearances: { include: { pitchEvents: true } }, lineups: true, gameNotes: true } });
}

export async function getGamesByDateRange(start: Date, end: Date) {
  const prisma = await getPrisma();
  return prisma.game.findMany({ where: { gameDate: { gte: start, lte: end } }, orderBy: { gameDate: "desc" } });
}

export async function createGame(data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.game.create({ data });
}

export async function updateGame(id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.game.update({ where: { id }, data });
}

export async function deleteGame(id: string) {
  const prisma = await getPrisma();
  return prisma.game.delete({ where: { id } });
}

export async function duplicateGame(id: string) {
  const original = await getGameById(id) as { [key: string]: unknown; lineups?: Array<Record<string, unknown>> } | null;
  if (!original) throw new Error("複製元の試合が見つかりません。");
  const prisma = await getPrisma();
  return prisma.game.create({
    data: {
      mode: original.mode,
      gameDate: new Date(),
      venue: original.venue,
      competition: original.competition,
      homeTeamName: original.homeTeamName,
      awayTeamName: original.awayTeamName,
      favoriteTeamName: original.favoriteTeamName,
      weather: original.weather,
      seatMemo: original.seatMemo,
      watchMemo: original.watchMemo,
      status: "NORMAL",
      lineups: {
        create: (original.lineups ?? []).map((entry) => ({
          teamSide: entry.teamSide,
          battingOrder: entry.battingOrder,
          playerName: entry.playerName,
          position: entry.position,
          number: entry.number,
          uniformNumber: entry.uniformNumber,
          role: entry.role,
          isStarter: entry.isStarter ?? true,
          memo: entry.memo,
        })),
      },
    },
  });
}

export async function savePlateAppearance(gameId: string, data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.plateAppearance.create({ data: { ...data, gameId } });
}
