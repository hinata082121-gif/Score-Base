import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";

export default function SimpleGamePage() {
  return (
    <PageShell title="簡易記録" lead="観戦メモに加えて、スタメン、イニングスコア、投手・本塁打メモを残します。">
      <GameForm mode="SIMPLE" />
    </PageShell>
  );
}
