import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { GamesListClient } from "./GamesListClient";

export default async function GamesPage() {
  const user = await getCurrentUserOrNull();
  const dbGames = user ? await listGamesForUser(user.id) : [];
  return (
    <PageShell title="観戦記録一覧" lead="期間フィルターとソートで、保存した試合を探せます。">
      <GamesListClient dbGames={dbGames} dbEnabled={Boolean(user)} />
    </PageShell>
  );
}
