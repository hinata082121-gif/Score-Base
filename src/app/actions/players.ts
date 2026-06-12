"use server";

import { revalidatePath } from "next/cache";
import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { createPlayerForUser, deletePlayerForUser, updatePlayerForUser } from "@/lib/repositories/players";
import { dbErrorMessage } from "@/lib/db/prisma";

type PlayerResult = {
  id: string;
  name: string;
  number?: string | null;
  primaryPosition?: string | null;
  teamId?: string | null;
  teamName?: string | null;
};
type ActionResult = { ok: true; id?: string; player?: PlayerResult } | { ok: false; error: string };

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
    sourceLocalId: String(formData.get("sourceLocalId") ?? "") || undefined,
  };
}

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

function playerResult(player: unknown): PlayerResult {
  const row = player as {
    id?: string | null;
    name?: string | null;
    number?: string | null;
    primaryPosition?: string | null;
    primaryPos?: string | null;
    teamId?: string | null;
    team?: { name?: string | null } | null;
  };
  return {
    id: String(row.id ?? ""),
    name: row.name ?? "",
    number: row.number ?? "",
    primaryPosition: row.primaryPosition ?? row.primaryPos ?? "",
    teamId: row.teamId ?? "",
    teamName: row.team?.name ?? "",
  };
}

function revalidatePlayerPaths(teamId?: string | null, playerId?: string) {
  revalidatePath("/players");
  if (playerId) revalidatePath(`/players/${playerId}`);
  if (teamId) {
    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);
  }
}

export async function createPlayerAction(formData: FormData): Promise<ActionResult> {
  const input = data(formData);
  if (!input.name) return { ok: false, error: "選手名は必須です。" };
  try {
    const user = await requireCurrentUser();
    const player = await createPlayerForUser(input, user.id);
    const result = playerResult(player);
    revalidatePlayerPaths(result.teamId, result.id);
    return { ok: true, id: result.id, player: result };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function updatePlayerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const player = await updatePlayerForUser(id, data(formData), user.id);
    const result = playerResult(player);
    revalidatePlayerPaths(result.teamId, id);
    return { ok: true, id, player: result };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}

export async function deletePlayerAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    const player = await deletePlayerForUser(id, user.id) as { teamId?: string | null };
    revalidatePlayerPaths(player.teamId, id);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
