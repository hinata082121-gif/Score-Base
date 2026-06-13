import { ExportClient } from "./ExportClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listRecentExportSnapshotsForGame } from "@/lib/repositories/exportSnapshots";
import { getGameByIdForUser, listGamesForUser } from "@/lib/repositories/games";

export const dynamic = "force-dynamic";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await getCurrentUserOrNull().then(
    (user) => ({ user, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to resolve current user for export route.", {
      route: "/games/[id]/export",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { user: null, failed: true };
  });
  const user = authResult.user;
  const gameResult = user ? await getGameByIdForUser(id, user.id).then(
    (game) => ({ game, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to load DB game export.", {
      route: "/games/[id]/export",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { game: null, failed: true };
  }) : { game: null, failed: false };
  const dbGame = gameResult.game;
  const dbGames = user ? await listGamesForUser(user.id).catch(() => []) : [];
  const snapshots = user && dbGame ? await listRecentExportSnapshotsForGame(id, user.id).catch(() => []) as Array<{ id: string; createdAt?: Date; type: string; style?: string | null; fileName?: string | null; dataJson?: string | null }> : [];
  return <ExportClient id={id} initialGame={dbGame} initialGames={dbGames} initialSnapshots={snapshots.map((snapshot) => ({
    id: snapshot.id,
    createdAt: snapshot.createdAt?.toISOString?.() ?? "",
    type: snapshot.type,
    style: snapshot.style ?? "",
    fileName: snapshot.fileName ?? "",
    dataSummary: snapshot.dataJson ? snapshot.dataJson.slice(0, 120) : "",
  }))} dbEnabled={Boolean(dbGame)} dbAccessFailed={authResult.failed || gameResult.failed} />;
}
