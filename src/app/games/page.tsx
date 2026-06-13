import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { GamesListClient } from "./GamesListClient";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const authResult = await getCurrentUserOrNull().then(
    (user) => ({ user, failed: false }),
    (error) => {
    console.warn("[ScoreBase] Failed to resolve current user for games route.", {
      route: "/games",
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { user: null, failed: true };
  });
  const user = authResult.user;
  const dbResult = user
    ? await listGamesForUser(user.id).then(
      (games) => ({ games, failed: false }),
      (error) => {
      console.warn("[ScoreBase] Failed to load DB games list.", {
        route: "/games",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      return { games: [], failed: true };
    })
    : { games: [], failed: false };
  return (
    <PageShell title="観戦記録一覧" lead="期間フィルターとソートで、保存した試合を探せます。">
      <GamesListClient dbGames={dbResult.games} dbEnabled={Boolean(user)} authLoadFailed={authResult.failed} dbLoadFailed={dbResult.failed} />
    </PageShell>
  );
}
