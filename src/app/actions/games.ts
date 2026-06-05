"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createGame, deleteGame, duplicateGame, savePlateAppearance, updateGame } from "@/lib/repositories/games";
import { dbErrorMessage } from "@/lib/db/prisma";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createGameAction(formData: FormData): Promise<ActionResult> {
  const homeTeamName = requiredString(formData, "homeTeamName");
  const awayTeamName = requiredString(formData, "awayTeamName");
  if (!homeTeamName || !awayTeamName) return { ok: false, error: "ホームチームとビジターチームは必須です。" };
  try {
    const game = await createGame({
      mode: requiredString(formData, "mode") || "WATCH_ONLY",
      gameDate: new Date(requiredString(formData, "gameDate") || new Date()),
      venue: requiredString(formData, "venue"),
      competition: requiredString(formData, "competition"),
      homeTeamName,
      awayTeamName,
      favoriteTeamName: requiredString(formData, "favoriteTeamName"),
      weather: requiredString(formData, "weather"),
      status: requiredString(formData, "status") || "NORMAL",
    }) as { id?: string };
    revalidatePath("/games");
    return { ok: true, id: game.id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function updateGameAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await updateGame(id, Object.fromEntries(formData.entries()));
    revalidatePath("/games");
    revalidatePath(`/games/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function deleteGameAction(id: string): Promise<ActionResult> {
  try {
    await deleteGame(id);
    revalidatePath("/games");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function duplicateGameAction(id: string): Promise<ActionResult> {
  try {
    const game = await duplicateGame(id) as { id?: string };
    revalidatePath("/games");
    return { ok: true, id: game.id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function duplicateGameAndRedirectAction(id: string) {
  const result = await duplicateGameAction(id);
  if (result.ok && result.id) redirect(`/games/${result.id}/edit`);
  redirect("/games");
}

export async function saveScorebookAction(gameId: string, formData: FormData): Promise<ActionResult> {
  return savePlateAppearanceAction(gameId, formData);
}

export async function savePlateAppearanceAction(gameId: string, formData: FormData): Promise<ActionResult> {
  try {
    await savePlateAppearance(gameId, {
      inning: Number(formData.get("inning") ?? 1),
      topBottom: requiredString(formData, "topBottom") || "TOP",
      battingOrder: Number(formData.get("battingOrder") ?? 1),
      batterName: requiredString(formData, "batterName"),
      pitcherName: requiredString(formData, "pitcherName"),
      balls: Number(formData.get("balls") ?? 0),
      strikes: Number(formData.get("strikes") ?? 0),
      outsBefore: Number(formData.get("outsBefore") ?? 0),
      outsAfter: Number(formData.get("outsAfter") ?? 0),
      result: requiredString(formData, "result"),
      rbi: Number(formData.get("rbi") ?? 0),
      runScored: formData.get("runScored") === "on",
      baseStateBefore: requiredString(formData, "baseStateBefore"),
      baseStateAfter: requiredString(formData, "baseStateAfter"),
      hitDirection: requiredString(formData, "hitDirection"),
      battedBallType: requiredString(formData, "battedBallType"),
      memo: requiredString(formData, "memo"),
    });
    revalidatePath(`/games/${gameId}/scorebook`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}
