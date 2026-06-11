import { ExportClient } from "./ExportClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser, listGamesForUser } from "@/lib/repositories/games";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const dbGame = user ? await getGameByIdForUser(id, user.id).catch(() => null) : null;
  const dbGames = user ? await listGamesForUser(user.id).catch(() => []) : [];
  return <ExportClient id={id} initialGame={dbGame} initialGames={dbGames} dbEnabled={Boolean(dbGame)} />;
}
