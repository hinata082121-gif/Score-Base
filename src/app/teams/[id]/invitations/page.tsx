import { TeamInvitationsClient } from "./TeamInvitationsClient";
import { getCurrentUserOrNull, getMembership } from "@/lib/auth/serverAuth";
import { normalizeRole, type TeamRole } from "@/lib/auth/permissions";
import { listInvitationsForTeam } from "@/lib/repositories/invitations";
import { getTeamForUser } from "@/lib/repositories/teams";

export default async function TeamInvitationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  if (!user) return <TeamInvitationsClient id={id} invitations={[]} />;
  const team = await getTeamForUser(id, user.id).catch(() => null) as { name?: string | null } | null;
  const membership = await getMembership(id, user.id);
  const invitations = team ? await listInvitationsForTeam(id, user.id).catch(() => []) as Array<{ id: string; email?: string | null; code: string; role?: string; status: string; createdAt?: Date; acceptedAt?: Date | null; expiresAt?: Date | null }> : [];
  return <TeamInvitationsClient id={id} teamName={team?.name ?? undefined} currentRole={membership?.role as TeamRole | undefined} invitations={invitations.map((invitation) => ({ id: invitation.id, email: invitation.email ?? "", code: invitation.code, role: normalizeRole(invitation.role), status: invitation.status, createdAt: invitation.createdAt?.toISOString?.() ?? "", acceptedAt: invitation.acceptedAt?.toISOString?.() ?? "", expiresAt: invitation.expiresAt?.toISOString?.() ?? "" }))} />;
}
