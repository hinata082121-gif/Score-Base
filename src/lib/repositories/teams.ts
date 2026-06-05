import { getPrisma } from "@/lib/db/prisma";

export async function getTeams() {
  const prisma = await getPrisma();
  return prisma.team.findMany({ orderBy: { name: "asc" }, include: { players: true } });
}

export async function getTeamById(id: string) {
  const prisma = await getPrisma();
  return prisma.team.findUnique({ where: { id }, include: { players: true, homeGames: true, awayGames: true } });
}

export async function createTeam(data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.team.create({ data });
}

export async function updateTeam(id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma();
  return prisma.team.update({ where: { id }, data });
}

export async function deleteTeam(id: string) {
  const prisma = await getPrisma();
  return prisma.team.delete({ where: { id } });
}
