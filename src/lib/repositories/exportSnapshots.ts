import { getPrisma } from "@/lib/db/prisma";
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
  return prisma.exportSnapshot.create({
    data: {
      userId,
      gameId: input.gameId,
      type: input.type,
      style: input.style,
      fileName: input.fileName,
      dataJson: input.dataJson,
    },
  });
}

export async function listRecentExportSnapshotsForGame(gameId: string, userId: string) {
  await getGameByIdForUser(gameId, userId);
  const prisma = await getPrisma();
  return prisma.exportSnapshot.findMany({ where: { gameId, userId }, orderBy: { createdAt: "desc" }, take: 10 });
}
