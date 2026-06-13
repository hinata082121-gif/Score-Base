import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { GamesListClient } from "./GamesListClient";

export default async function GamesPage() {
  const user = await getCurrentUserOrNull().catch(() => null);
  let dbLoadFailed = false;
  const dbGames = user
    ? await listGamesForUser(user.id).catch(() => {
      dbLoadFailed = true;
      console.warn("[ScoreBase] Failed to load DB games list.");
      return [];
    })
    : [];
  return (
    <PageShell title="観戦記録一覧" lead="期間フィルターとソートで、保存した試合を探せます。">
      <GamesListClient dbGames={dbGames} dbEnabled={Boolean(user)} dbLoadFailed={dbLoadFailed} />
    </PageShell>
  );
}
