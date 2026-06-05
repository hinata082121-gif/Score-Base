"use server";

import { revalidatePath } from "next/cache";
import { createPlayer, deletePlayer, updatePlayer } from "@/lib/repositories/players";
import { dbErrorMessage } from "@/lib/db/prisma";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export async function createPlayerAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "選手名は必須です。" };
  try {
    const player = await createPlayer({
      teamId: String(formData.get("teamId") || "") || null,
      name,
      kana: String(formData.get("kana") ?? ""),
      number: String(formData.get("number") ?? ""),
      throwingHand: String(formData.get("throwingHand") ?? "UNKNOWN"),
      battingSide: String(formData.get("battingSide") ?? "UNKNOWN"),
      primaryPosition: String(formData.get("primaryPosition") ?? ""),
      memo: String(formData.get("memo") ?? ""),
    }) as { id?: string };
    revalidatePath("/players");
    return { ok: true, id: player.id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function updatePlayerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await updatePlayer(id, Object.fromEntries(formData.entries()));
    revalidatePath("/players");
    revalidatePath(`/players/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function deletePlayerAction(id: string): Promise<ActionResult> {
  try {
    await deletePlayer(id);
    revalidatePath("/players");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}
