import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";

export default function ScorebookGamePage() {
  return (
    <PageShell title="詳細スコアブック記録" lead="SBO、打席結果、打球方向、走者状況をボタン入力で構造化して保存します。">
      <GameForm mode="SCOREBOOK" />
    </PageShell>
  );
}
