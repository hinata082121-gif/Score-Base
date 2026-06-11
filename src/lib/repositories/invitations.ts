import { getPublicAppUrl } from "@/lib/url";
import { PublicActionError, requireTeamRole } from "@/lib/auth/serverAuth";
import { getPrisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/repositories/auditLogs";
import type { TeamRole } from "@/lib/auth/permissions";

type InvitationRow = { id: string; teamId: string; role: TeamRole; status: string; expiresAt?: Date | null };

function code() {
  return `invite_${crypto.randomUUID()}`;
}

export async function createInvitation(teamId: string, role: TeamRole, userId: string, email?: string, expiresAt?: Date | null) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN"]);
  if (role === "OWNER") throw new PublicActionError("OWNER招待は作成できません。");
  const prisma = await getPrisma();
  const invitation = await prisma.invitation.create({
    data: { teamId, role, email, createdById: userId, code: code(), status: "PENDING", expiresAt },
  });
  await recordAuditLog({ userId, teamId, action: "CREATE", resourceType: "Invitation", resourceId: (invitation as { id?: string }).id, detail: `role=${role};expires=${expiresAt ? expiresAt.toISOString() : "none"}` });
  return invitation;
}

export async function listInvitationsForTeam(teamId: string, userId: string) {
  await requireTeamRole(teamId, userId, ["OWNER", "ADMIN"]);
  const prisma = await getPrisma();
  return prisma.invitation.findMany({ where: { teamId }, orderBy: { createdAt: "desc" } });
}

export async function getInvitationByCode(codeValue: string) {
  const prisma = await getPrisma();
  return prisma.invitation.findUnique({ where: { code: codeValue }, include: { team: true } });
}

export async function acceptInvitation(codeValue: string, userId: string) {
  const prisma = await getPrisma();
  const invitation = await prisma.invitation.findUnique({ where: { code: codeValue } }) as InvitationRow | null;
  if (!invitation || invitation.status !== "PENDING") throw new PublicActionError("招待リンクが無効です。");
  if (invitation.role === "OWNER") throw new PublicActionError("OWNER招待は受諾できません。");
  if (invitation.expiresAt && invitation.expiresAt < new Date()) throw new PublicActionError("招待リンクの期限が切れています。");
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: invitation.teamId, userId } },
    create: { teamId: invitation.teamId, userId, role: invitation.role, status: "ACTIVE" },
    update: { status: "ACTIVE", role: invitation.role },
  });
  const accepted = await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED", acceptedById: userId, acceptedAt: new Date() } });
  await recordAuditLog({ userId, teamId: invitation.teamId, action: "ACCEPT", resourceType: "Invitation", resourceId: invitation.id, detail: `role=${invitation.role}` });
  return accepted;
}

export async function revokeInvitation(invitationId: string, userId: string) {
  const prisma = await getPrisma();
  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } }) as InvitationRow | null;
  if (!invitation) throw new PublicActionError("招待が見つかりません。");
  await requireTeamRole(invitation.teamId, userId, ["OWNER", "ADMIN"]);
  const revoked = await prisma.invitation.update({ where: { id: invitationId }, data: { status: "REVOKED" } });
  await recordAuditLog({ userId, teamId: invitation.teamId, action: "REVOKE", resourceType: "Invitation", resourceId: invitationId });
  return revoked;
}

export function invitationUrl(codeValue: string) {
  return `${getPublicAppUrl().toString().replace(/\/$/, "")}/invite/${codeValue}`;
}
