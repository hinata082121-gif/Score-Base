"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createGameForUser, deleteGameForUser, duplicateGameForUser, saveScorebookForGame, updateGameForUser } from "@/lib/repositories/games";
import { dbErrorMessage } from "@/lib/db/prisma";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import type { ScoreBaseGame } from "@/lib/types";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function parsePayload(formData: FormData): ScoreBaseGame {
  const raw = String(formData.get("payloadJson") ?? "");
  if (!raw) throw new Error("保存データが不足しています。");
  return JSON.parse(raw) as ScoreBaseGame;
}

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function createGameAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const game = await createGameForUser(parsePayload(formData), user.id);
    revalidatePath("/games");
    return { ok: true, id: game.id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function updateGameAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const game = await updateGameForUser(id, parsePayload(formData), user.id);
    revalidatePath("/games");
    revalidatePath(`/games/${id}`);
    revalidatePath(`/games/${id}/scorebook`);
    revalidatePath(`/games/${id}/export`);
    return { ok: true, id: game.id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function deleteGameAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await deleteGameForUser(id, user.id);
    revalidatePath("/games");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function duplicateGameAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const game = await duplicateGameForUser(id, user.id);
    revalidatePath("/games");
    return { ok: true, id: game.id };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function duplicateGameAndRedirectAction(id: string) {
  const result = await duplicateGameAction(id);
  if (result.ok && result.id) redirect(`/games/${result.id}/edit`);
  redirect("/games");
}

export async function saveScorebookAction(gameId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await saveScorebookForGame(gameId, parsePayload(formData), user.id);
    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${gameId}/scorebook`);
    revalidatePath(`/games/${gameId}/export`);
    return { ok: true, id: gameId };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function savePlateAppearanceAction(gameId: string, formData: FormData): Promise<ActionResult> {
  return saveScorebookAction(gameId, formData);
}
