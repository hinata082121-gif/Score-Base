"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { loadGames } from "@/lib/storage";
import { loadPlayers, loadTeam, PlayerMaster, TeamMaster } from "@/lib/masterStorage";

export function TeamDetailClient({ id }: { id: string }) {
  const [team, setTeam] = useState<TeamMaster | null>(null);
  const [players, setPlayers] = useState<PlayerMaster[]>([]);
  const [gameCount, setGameCount] = useState(0);

  useEffect(() => {
    const current = loadTeam(id) ?? null;
    setTeam(current);
    setPlayers(loadPlayers().filter((player) => player.teamId === id));
    setGameCount(current ? loadGames().filter((game) => game.homeTeamName === current.name || game.awayTeamName === current.name).length : 0);
  }, [id]);

  if (!team) return <PageShell title="チームが見つかりません"><Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href="/teams">チーム一覧へ</Link></PageShell>;

  return (
    <PageShell title={team.name} lead={`${team.shortName || "略称なし"} / ${team.homeGround || "本拠地未設定"}`}>
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-700">{team.memo || "メモはありません。"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={`/teams/${id}/edit`}>編集</Link>
            <Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href={`/players/new?teamId=${id}`}>選手追加</Link>
            <Link className="rounded-md bg-amber-600 px-4 py-3 text-sm font-bold text-white" href="/stats/teams">チーム成績</Link>
          </div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">選手一覧</h2>
          <div className="mt-3 grid gap-2">
            {players.map((player) => <Link key={player.id} className="rounded-md bg-stone-50 p-3 text-sm font-bold text-stone-800" href={`/players/${player.id}`}>#{player.number || "-"} {player.name} / {player.primaryPosition || "-"}</Link>)}
            {players.length === 0 ? <p className="text-sm font-bold text-stone-500">選手が未登録です。</p> : null}
          </div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">関連試合</h2>
          <p className="mt-2 text-sm text-stone-600">関連試合数: {gameCount}</p>
        </section>
      </div>
    </PageShell>
  );
}
