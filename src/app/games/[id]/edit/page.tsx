import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser } from "@/lib/repositories/games";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const dbGame = user ? await getGameByIdForUser(id, user.id).catch(() => null) : null;
  return (
    <PageShell title="観戦記録を編集" lead="保存済みの内容を読み込み、再保存します。">
      <GameForm mode={dbGame?.mode ?? "WATCH_ONLY"} editId={id} initialGame={dbGame} dbEnabled={Boolean(dbGame)} />
    </PageShell>
  );
}
