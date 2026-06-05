"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { loadGames } from "@/lib/storage";
import { playerStats } from "@/lib/stats";
import { loadPlayer, PlayerMaster } from "@/lib/masterStorage";

export function PlayerDetailClient({ id }: { id: string }) {
  const [player, setPlayer] = useState<PlayerMaster | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof playerStats>[number] | null>(null);
  const [appearances, setAppearances] = useState<Array<{ game: string; result: string }>>([]);

  useEffect(() => {
    const current = loadPlayer(id) ?? null;
    setPlayer(current);
    if (!current) return;
    const games = loadGames();
    setStats(playerStats(games).find((row) => row.name === current.name) ?? null);
    setAppearances(games.flatMap((game) => game.plateAppearances.filter((pa) => pa.batterName === current.name).map((pa) => ({ game: `${game.awayTeamName} vs ${game.homeTeamName}`, result: pa.result }))));
  }, [id]);

  if (!player) return <PageShell title="選手が見つかりません"><Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href="/players">選手一覧へ</Link></PageShell>;

  return (
    <PageShell title={player.name} lead={`${player.teamName || "未所属"} / #${player.number || "-"}`}>
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-700">投: {player.throwingHand} / 打: {player.battingSide} / 主守備: {player.primaryPosition || "-"}</p>
          <p className="mt-2 text-sm text-stone-700">{player.memo || "メモはありません。"}</p>
          <Link className="mt-4 inline-flex rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={`/players/${id}/edit`}>編集</Link>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">打者成績</h2>
          {stats ? <p className="mt-2 text-sm text-stone-700">打席 {stats.pa} / 安打 {stats.h} / 本塁打 {stats.hr} / 打点 {stats.rbi} / 打率 {stats.avg} / OPS {stats.ops}</p> : <p className="mt-2 text-sm font-bold text-stone-500">成績集計対象がありません。</p>}
          <p className="mt-3 rounded-md bg-stone-50 p-3 text-sm font-bold text-stone-600">投手成績は今後対応予定です。</p>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">関連PlateAppearance</h2>
          {appearances.map((appearance, index) => <p key={`${appearance.game}-${index}`} className="border-b border-stone-100 py-2 text-sm">{appearance.game} / {appearance.result}</p>)}
          {appearances.length === 0 ? <p className="mt-2 text-sm font-bold text-stone-500">出場試合・打席記録がありません。</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
