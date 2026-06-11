import { getPrisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/repositories/auditLogs";
import { getGameByIdForUser } from "@/lib/repositories/games";

export type ExportSnapshotInput = {
  gameId: string;
  type: "CSV" | "PNG" | "SHARE_TEXT" | "SCOREBOOK_EXPORT";
  style?: string;
  fileName?: string;
  dataJson?: string;
};

export async function saveExportSnapshotForUser(input: ExportSnapshotInput, userId: string) {
  await getGameByIdForUser(input.gameId, userId);
  const prisma = await getPrisma();
  const snapshot = await prisma.exportSnapshot.create({
    data: {
      userId,
      gameId: input.gameId,
      type: input.type,
      style: input.style,
      fileName: input.fileName,
      dataJson: input.dataJson,
    },
  });
  await recordAuditLog({ userId, action: "CREATE", resourceType: "ExportSnapshot", resourceId: (snapshot as { id?: string }).id, detail: `${input.type}:${input.fileName ?? ""}` });
  return snapshot;
}

export async function listRecentExportSnapshotsForGame(gameId: string, userId: string) {
  await getGameByIdForUser(gameId, userId);
  const prisma = await getPrisma();
  return prisma.exportSnapshot.findMany({ where: { gameId }, orderBy: { createdAt: "desc" }, take: 10 });
}
