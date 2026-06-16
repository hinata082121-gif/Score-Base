import { GameForm } from "@/components/GameForm";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser, listGamesForUser } from "@/lib/repositories/games";
import { listPlayersForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";
import type { ScoreBaseGame } from "@/lib/types";

type EditLoadResult =
  | { source: "db"; game: ScoreBaseGame }
  | { source: "local"; gameId: string }
  | { source: "dbError"; message: string };

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull().catch(() => null);
  let loadResult: EditLoadResult = { source: "local", gameId: id };
  let teams: Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }> = [];
  let players: Array<{ id: string; name?: string | null; teamId?: string | null; number?: string | null; primaryPosition?: string | null; primaryPos?: string | null }> = [];
  let games: ScoreBaseGame[] = [];

  if (user) {
    try {
      const dbGame = await getGameByIdForUser(id, user.id);
      loadResult = { source: "db", game: dbGame };
    } catch (error) {
      if (id.startsWith("game_")) {
        loadResult = { source: "local", gameId: id };
      } else {
        const name = error instanceof Error ? error.name : "UnknownError";
        loadResult = { source: "dbError", message: `DB保存済み記録の取得に失敗しました。route=/games/${id}/edit error=${name}` };
      }
    }
    if (loadResult.source !== "dbError") {
      teams = await listTeamsForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }>;
      players = await listPlayersForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; teamId?: string | null; number?: string | null; primaryPosition?: string | null; primaryPos?: string | null }>;
      games = await listGamesForUser(user.id).catch(() => []);
    }
  }

  if (loadResult.source === "dbError") {
    return (
      <PageShell title="観戦記録を編集" lead="DB保存済みの記録を読み込めませんでした。">
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          <p>{loadResult.message}</p>
          <p className="mt-2">DB取得失敗を端末内データとして扱わないため、編集画面の表示を停止しています。時間を置いて再読み込みしてください。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md bg-emerald-700 px-3 py-2 text-white" href={`/games/${id}/edit`}>再試行</Link>
            <Link className="rounded-md bg-white px-3 py-2 text-stone-800 ring-1 ring-stone-300" href="/games">一覧へ戻る</Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const dbGame = loadResult.source === "db" ? loadResult.game : null;
  return (
    <PageShell title="観戦記録を編集" lead="保存済みの内容を読み込み、再保存します。">
      <GameForm mode={dbGame?.mode ?? "WATCH_ONLY"} editId={id} initialGame={dbGame} dbEnabled={Boolean(dbGame)} dbTeams={teams.map((team) => ({ id: team.id, label: team.name ?? "", helper: team.shortName ?? team.homeGround ?? "", homeGround: team.homeGround ?? "" }))} dbPlayers={players.map((player) => ({ id: player.id, label: player.name ?? "", teamId: player.teamId ?? "", number: player.number ?? "", position: player.primaryPosition ?? player.primaryPos ?? "" }))} dbGames={games} />
    </PageShell>
  );
}
