import { normalizeRole } from "@/lib/auth/permissions";
import { PublicActionError, requireTeamRole } from "@/lib/auth/serverAuth";
import { getPrisma } from "@/lib/db/prisma";
import type { TeamRole } from "@/lib/auth/permissions";

export type DbTeamInput = {
  name: string;
  shortName?: string;
  category?: string;
  homeGround?: string;
  primaryColor?: string;
  memo?: string;
  sourceLocalId?: string;
};

const includeTeam = { players: true, members: true, homeGames: true, awayGames: true, teamGames: true };

export async function listTeamsForUser(userId: string) {
  const prisma = await getPrisma();
  return prisma.team.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { userId },
        { members: { some: { userId, status: "ACTIVE" } } },
      ],
    },
    orderBy: { name: "asc" },
    include: includeTeam,
  });
}

export async function getTeamForUser(teamId: string, userId: string) {
  const prisma = await getPrisma();
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [
        { ownerId: userId },
        { userId },
        { members: { some: { userId, status: "ACTIVE" } } },
      ],
    },
    include: includeTeam,
  });
  if (!team) throw new PublicActionError("チームが見つかりません。");
  return team;
}

export async function createTeamForUser(input: DbTeamInput, userId: string) {
  const prisma = await getPrisma();
  if (input.sourceLocalId) {
    const existing = await prisma.team.findFirst({ where: { ownerId: userId, sourceLocalId: input.sourceLocalId }, include: includeTeam });
    if (existing) return existing;
  }
  return prisma.team.create({
    data: {
      ...input,
      userId,
      ownerId: userId,
      visibility: "PRIVATE",
      members: {
        create: { userId, role: "OWNER", status: "ACTIVE" },
      },
    },
    include: includeTeam,
  });
}

export async function updateTeamForUser(teamId: string, input: DbTeamInput, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN", "EDITOR"]);
  const prisma = await getPrisma();
  return prisma.team.update({ where: { id: teamId }, data: input, include: includeTeam });
}

export async function deleteTeamForUser(teamId: string, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER"]);
  const prisma = await getPrisma();
  return prisma.team.delete({ where: { id: teamId } });
}

export async function listTeamMembers(teamId: string, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN", "EDITOR", "SCORER", "VIEWER"]);
  const prisma = await getPrisma();
  return prisma.teamMember.findMany({ where: { teamId }, include: { user: { select: { id: true, email: true, name: true, displayName: true } } }, orderBy: { joinedAt: "asc" } });
}

export async function updateMemberRole(teamId: string, memberUserId: string, role: TeamRole, actingUserId: string) {
  await requireTeamRole(teamId, actingUserId, ["OWNER", "ADMIN"]);
  if (normalizeRole(role) === "OWNER") throw new PublicActionError("OWNERへの変更は現在サポートしていません。");
  const prisma = await getPrisma();
  const current = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: memberUserId } } }) as { role?: string } | null;
  if (current?.role === "OWNER") {
    const ownerCount = await prisma.teamMember.count({ where: { teamId, role: "OWNER", status: "ACTIVE" } }) as number;
    if (ownerCount <= 1) throw new PublicActionError("最後のOWNERは変更できません。");
  }
  return prisma.teamMember.update({ where: { teamId_userId: { teamId, userId: memberUserId } }, data: { role } });
}

export async function removeTeamMember(teamId: string, memberUserId: string, actingUserId: string) {
  await requireTeamRole(teamId, actingUserId, ["OWNER", "ADMIN"]);
  const prisma = await getPrisma();
  const current = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: memberUserId } } }) as { role?: string } | null;
  if (current?.role === "OWNER") {
    const ownerCount = await prisma.teamMember.count({ where: { teamId, role: "OWNER", status: "ACTIVE" } }) as number;
    if (ownerCount <= 1) throw new PublicActionError("最後のOWNERは削除できません。");
  }
  return prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId: memberUserId } } });
}

export const getTeams = listTeamsForUser;
export const getTeamById = getTeamForUser;
export const createTeam = createTeamForUser;
export const updateTeam = updateTeamForUser;
export const deleteTeam = deleteTeamForUser;
