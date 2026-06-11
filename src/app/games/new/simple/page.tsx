import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";

export default async function SimpleGamePage() {
  const user = await getCurrentUserOrNull();
  return (
    <PageShell title="簡易記録" lead="観戦メモに加えて、スタメン、イニングスコア、投手・本塁打メモを残します。">
      <GameForm mode="SIMPLE" dbEnabled={Boolean(user)} />
    </PageShell>
  );
}
