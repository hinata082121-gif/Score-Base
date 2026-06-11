"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { createPlayerForUser, deletePlayerForUser, updatePlayerForUser } from "@/lib/repositories/players";
import { dbErrorMessage } from "@/lib/db/prisma";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function data(formData: FormData) {
  return {
    teamId: String(formData.get("teamId") || "") || null,
    name: String(formData.get("name") ?? "").trim(),
    kana: String(formData.get("kana") ?? ""),
    number: String(formData.get("number") ?? ""),
    throwingHand: String(formData.get("throwingHand") ?? "UNKNOWN"),
    battingSide: String(formData.get("battingSide") ?? "UNKNOWN"),
    primaryPosition: String(formData.get("primaryPosition") ?? ""),
    memo: String(formData.get("memo") ?? ""),
  };
}

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function createPlayerAction(formData: FormData): Promise<ActionResult> {
  const input = data(formData);
  if (!input.name) return { ok: false, error: "選手名は必須です。" };
  try {
    const user = await requireCurrentUser();
    const player = await createPlayerForUser(input, user.id) as { id?: string };
    revalidatePath("/players");
    return { ok: true, id: player.id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function updatePlayerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await updatePlayerForUser(id, data(formData), user.id);
    revalidatePath("/players");
    revalidatePath(`/players/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function deletePlayerAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await deletePlayerForUser(id, user.id);
    revalidatePath("/players");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
