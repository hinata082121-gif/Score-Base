import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";

export default async function WatchGamePage() {
  const user = await getCurrentUserOrNull();
  return (
    <PageShell title="観戦記録のみ" lead="感想、球場、応援チーム、MVPなどの観戦ログを記録します。">
      <GameForm mode="WATCH_ONLY" dbEnabled={Boolean(user)} />
    </PageShell>
  );
}
