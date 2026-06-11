import { ExportClient } from "./ExportClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listRecentExportSnapshotsForGame } from "@/lib/repositories/exportSnapshots";
import { getGameByIdForUser, listGamesForUser } from "@/lib/repositories/games";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const dbGame = user ? await getGameByIdForUser(id, user.id).catch(() => null) : null;
  const dbGames = user ? await listGamesForUser(user.id).catch(() => []) : [];
  const snapshots = user && dbGame ? await listRecentExportSnapshotsForGame(id, user.id).catch(() => []) as Array<{ id: string; createdAt?: Date; type: string; style?: string | null; fileName?: string | null; dataJson?: string | null }> : [];
  return <ExportClient id={id} initialGame={dbGame} initialGames={dbGames} initialSnapshots={snapshots.map((snapshot) => ({
    id: snapshot.id,
    createdAt: snapshot.createdAt?.toISOString?.() ?? "",
    type: snapshot.type,
    style: snapshot.style ?? "",
    fileName: snapshot.fileName ?? "",
    dataSummary: snapshot.dataJson ? snapshot.dataJson.slice(0, 120) : "",
  }))} dbEnabled={Boolean(dbGame)} />;
}
