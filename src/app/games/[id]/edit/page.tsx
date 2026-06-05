import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell title="観戦記録を編集" lead="保存済みの内容を読み込み、再保存します。">
      <GameForm mode="WATCH_ONLY" editId={id} />
    </PageShell>
  );
}
