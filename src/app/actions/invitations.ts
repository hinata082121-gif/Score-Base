"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { acceptInvitation, createInvitation, invitationUrl, revokeInvitation } from "@/lib/repositories/invitations";
import { dbErrorMessage } from "@/lib/db/prisma";
import type { TeamRole } from "@/lib/auth/permissions";

type ActionResult = { ok: true; id?: string; url?: string } | { ok: false; error: string };

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

function expiresAtFor(value?: string) {
  if (value === "1" || value === "7" || value === "30") {
    const date = new Date();
    date.setDate(date.getDate() + Number(value));
    return date;
  }
  return null;
}

export async function createInvitationAction(teamId: string, role: TeamRole, email?: string, expiresInDays?: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const invitation = await createInvitation(teamId, role, user.id, email, expiresAtFor(expiresInDays)) as { id?: string; code?: string };
    revalidatePath(`/teams/${teamId}/invitations`);
    return { ok: true, id: invitation.id, url: invitation.code ? invitationUrl(invitation.code) : undefined };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function acceptInvitationAction(code: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await acceptInvitation(code, user.id);
    revalidatePath("/teams");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function revokeInvitationAction(teamId: string, invitationId: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await revokeInvitation(invitationId, user.id);
    revalidatePath(`/teams/${teamId}/invitations`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
