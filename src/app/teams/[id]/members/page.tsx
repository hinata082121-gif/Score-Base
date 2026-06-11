import { TeamMembersClient } from "./TeamMembersClient";
import { getCurrentUserOrNull, getMembership } from "@/lib/auth/serverAuth";
import { normalizeRole, type TeamRole } from "@/lib/auth/permissions";
import { getTeamForUser, listTeamMembers } from "@/lib/repositories/teams";

export default async function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  if (!user) return <TeamMembersClient id={id} members={[]} />;
  const team = await getTeamForUser(id, user.id).catch(() => null) as { name?: string | null } | null;
  const membership = await getMembership(id, user.id);
  const members = team ? await listTeamMembers(id, user.id).catch(() => []) as Array<{ id: string; userId: string; role?: string; joinedAt?: Date; user?: { email?: string | null; name?: string | null; displayName?: string | null } }> : [];
  return <TeamMembersClient id={id} teamName={team?.name ?? undefined} currentRole={membership?.role as TeamRole | undefined} members={members.map((member) => ({ id: member.id, userId: member.userId, role: normalizeRole(member.role), joinedAt: member.joinedAt?.toISOString?.() ?? "", email: member.user?.email ?? "", name: member.user?.displayName ?? member.user?.name ?? "" }))} />;
}
