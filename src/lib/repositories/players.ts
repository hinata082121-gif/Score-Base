import { getPrisma } from "@/lib/db/prisma";

export async function getPlayers() {
  const prisma = await getPrisma();
  return prisma.player.findMany({ orderBy: { name: "asc" }, include: { team: true } });
}

export async function getPlayersByTeam(teamId: string) {
  const prisma = await getPrisma();
  return prisma.player.findMany({ where: { teamId }, orderBy: { number: "asc" } });
}

export async function getPlayerById(id: string) {
  const prisma = await getPrisma();
  return prisma.player.findUnique({ where: { id }, include: { team: true, battingRecords: true, pitchingRecords: true } });
}

export async function createPlayer(data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.player.create({ data });
}

export async function updatePlayer(id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.player.update({ where: { id }, data });
}

export async function deletePlayer(id: string) {
  const prisma = await getPrisma();
  return prisma.player.delete({ where: { id } });
}
