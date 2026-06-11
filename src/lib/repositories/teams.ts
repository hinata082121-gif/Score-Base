import { normalizeRole } from "@/lib/auth/permissions";
import { PublicActionError, requireTeamRole } from "@/lib/auth/serverAuth";
import { getPrisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/repositories/auditLogs";
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
  const team = await prisma.team.create({
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
  await recordAuditLog({ userId, teamId: (team as { id?: string }).id, action: "CREATE", resourceType: "Team", resourceId: (team as { id?: string }).id, detail: input.name });
  return team;
}

export async function updateTeamForUser(teamId: string, input: DbTeamInput, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN", "EDITOR"]);
  const prisma = await getPrisma();
  const team = await prisma.team.update({ where: { id: teamId }, data: input, include: includeTeam });
  await recordAuditLog({ userId, teamId, action: "UPDATE", resourceType: "Team", resourceId: teamId, detail: input.name });
  return team;
}

export async function deleteTeamForUser(teamId: string, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER"]);
  const prisma = await getPrisma();
  const team = await prisma.team.delete({ where: { id: teamId } });
  await recordAuditLog({ userId, teamId, action: "DELETE", resourceType: "Team", resourceId: teamId });
  return team;
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
  const member = await prisma.teamMember.update({ where: { teamId_userId: { teamId, userId: memberUserId } }, data: { role } });
  await recordAuditLog({ userId: actingUserId, teamId, action: "UPDATE_ROLE", resourceType: "TeamMember", resourceId: memberUserId, detail: `role=${role}` });
  return member;
}

export async function removeTeamMember(teamId: string, memberUserId: string, actingUserId: string) {
  await requireTeamRole(teamId, actingUserId, ["OWNER", "ADMIN"]);
  const prisma = await getPrisma();
  const current = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: memberUserId } } }) as { role?: string } | null;
  if (current?.role === "OWNER") {
    const ownerCount = await prisma.teamMember.count({ where: { teamId, role: "OWNER", status: "ACTIVE" } }) as number;
    if (ownerCount <= 1) throw new PublicActionError("最後のOWNERは削除できません。");
  }
  const member = await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId: memberUserId } } });
  await recordAuditLog({ userId: actingUserId, teamId, action: "REMOVE", resourceType: "TeamMember", resourceId: memberUserId });
  return member;
}

export const getTeams = listTeamsForUser;
export const getTeamById = getTeamForUser;
export const createTeam = createTeamForUser;
export const updateTeam = updateTeamForUser;
export const deleteTeam = deleteTeamForUser;
