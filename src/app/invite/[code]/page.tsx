import { InviteClient } from "./InviteClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getInvitationByCode } from "@/lib/repositories/invitations";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUserOrNull();
  const invitation = await getInvitationByCode(code).catch(() => null) as { code: string; teamId: string; role?: string; status: string; expiresAt?: Date | null; team?: { name?: string | null } } | null;
  return <InviteClient code={code} loggedIn={Boolean(user)} invitation={invitation ? { code: invitation.code, teamId: invitation.teamId, teamName: invitation.team?.name ?? "チーム", role: invitation.role ?? "VIEWER", status: invitation.status, expiresAt: invitation.expiresAt?.toISOString?.() ?? "" } : null} />;
}
