import { GameDetailClient } from "./GameDetailClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser } from "@/lib/repositories/games";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await getCurrentUserOrNull().then(
    (user) => ({ user, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to resolve current user for game detail route.", {
      route: "/games/[id]",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { user: null, failed: true };
  });
  const user = authResult.user;
  const gameResult = user ? await getGameByIdForUser(id, user.id).then(
    (game) => ({ game, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to load DB game detail.", {
      route: "/games/[id]",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { game: null, failed: true };
  }) : { game: null, failed: false };
  return <GameDetailClient id={id} initialGame={gameResult.game} dbEnabled={Boolean(gameResult.game)} dbAccessFailed={authResult.failed || gameResult.failed} />;
}
