import { PageShell } from "@/components/PageShell";
import { GamesListClient } from "./GamesListClient";

export default function GamesPage() {
  return (
    <PageShell title="観戦記録一覧" lead="期間フィルターとソートで、保存した試合を探せます。">
      <GamesListClient />
    </PageShell>
  );
}
