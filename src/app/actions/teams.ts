"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { createTeamForUser, deleteTeamForUser, updateTeamForUser } from "@/lib/repositories/teams";
import { dbErrorMessage } from "@/lib/db/prisma";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function data(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    shortName: String(formData.get("shortName") ?? ""),
    category: String(formData.get("category") ?? ""),
    homeGround: String(formData.get("homeGround") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? ""),
    memo: String(formData.get("memo") ?? ""),
    sourceLocalId: String(formData.get("sourceLocalId") ?? "") || undefined,
  };
}

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function createTeamAction(formData: FormData): Promise<ActionResult> {
  const input = data(formData);
  if (!input.name) return { ok: false, error: "チーム名は必須です。" };
  try {
    const user = await requireCurrentUser();
    const team = await createTeamForUser(input, user.id) as { id?: string };
    revalidatePath("/teams");
    return { ok: true, id: team.id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function updateTeamAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await updateTeamForUser(id, data(formData), user.id);
    revalidatePath("/teams");
    revalidatePath(`/teams/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function deleteTeamAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await deleteTeamForUser(id, user.id);
    revalidatePath("/teams");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
