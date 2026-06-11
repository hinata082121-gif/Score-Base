"use server";

import { publicActionError, requireCurrentUser } from "@/lib/auth/serverAuth";
import { dbErrorMessage } from "@/lib/db/prisma";
import { saveExportSnapshotForUser, type ExportSnapshotInput } from "@/lib/repositories/exportSnapshots";

type ActionResult = { ok: true } | { ok: false; error: string };

function actionError(error: unknown) {
  return publicActionError(error) ?? dbErrorMessage(error);
}

export async function saveExportSnapshotAction(input: ExportSnapshotInput): Promise<ActionResult> {
  try {
    const user = await requireCurrentUser();
    await saveExportSnapshotForUser(input, user.id);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: actionError(error) };
  }
}
