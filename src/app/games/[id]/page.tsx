import { GameDetailClient } from "./GameDetailClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser } from "@/lib/repositories/games";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const dbGame = user ? await getGameByIdForUser(id, user.id).catch(() => null) : null;
  return <GameDetailClient id={id} initialGame={dbGame} dbEnabled={Boolean(dbGame)} />;
}
