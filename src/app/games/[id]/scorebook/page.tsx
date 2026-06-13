import { ScorebookClient } from "./ScorebookClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getScorebookForGame } from "@/lib/repositories/games";

export const dynamic = "force-dynamic";

export default async function ScorebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await getCurrentUserOrNull().then(
    (user) => ({ user, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to resolve current user for scorebook route.", {
      route: "/games/[id]/scorebook",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { user: null, failed: true };
  });
  const user = authResult.user;
  const gameResult = user ? await getScorebookForGame(id, user.id).then(
    (game) => ({ game, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to load DB scorebook.", {
      route: "/games/[id]/scorebook",
      gameId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { game: null, failed: true };
  }) : { game: null, failed: false };
  return <ScorebookClient id={id} initialGame={gameResult.game} dbEnabled={Boolean(gameResult.game)} dbAccessFailed={authResult.failed || gameResult.failed} />;
}
