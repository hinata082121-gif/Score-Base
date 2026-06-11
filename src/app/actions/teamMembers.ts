"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { removeTeamMember, updateMemberRole } from "@/lib/repositories/teamMembers";
import { dbErrorMessage } from "@/lib/db/prisma";
import type { TeamRole } from "@/lib/auth/permissions";

type ActionResult = { ok: true } | { ok: false; error: string };

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function updateMemberRoleAction(teamId: string, memberUserId: string, role: TeamRole): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await updateMemberRole(teamId, memberUserId, role, user.id);
    revalidatePath(`/teams/${teamId}/members`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function updateTeamMemberRoleAction(teamId: string, memberUserId: string, role: TeamRole): Promise<ActionResult> {
  return updateMemberRoleAction(teamId, memberUserId, role);
}

export async function removeTeamMemberAction(teamId: string, memberUserId: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await removeTeamMember(teamId, memberUserId, user.id);
    revalidatePath(`/teams/${teamId}/members`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
