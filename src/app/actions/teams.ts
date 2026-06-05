"use server";

import { revalidatePath } from "next/cache";
import { createTeam, deleteTeam, updateTeam } from "@/lib/repositories/teams";
import { dbErrorMessage } from "@/lib/db/prisma";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export async function createTeamAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "チーム名は必須です。" };
  try {
    const team = await createTeam({
      name,
      shortName: String(formData.get("shortName") ?? ""),
      category: String(formData.get("category") ?? ""),
      homeGround: String(formData.get("homeGround") ?? ""),
      primaryColor: String(formData.get("primaryColor") ?? ""),
      memo: String(formData.get("memo") ?? ""),
    }) as { id?: string };
    revalidatePath("/teams");
    return { ok: true, id: team.id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function updateTeamAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await updateTeam(id, Object.fromEntries(formData.entries()));
    revalidatePath("/teams");
    revalidatePath(`/teams/${id}`);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}

export async function deleteTeamAction(id: string): Promise<ActionResult> {
  try {
    await deleteTeam(id);
    revalidatePath("/teams");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: dbErrorMessage(error) };
  }
}
