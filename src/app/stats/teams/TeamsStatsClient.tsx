"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SaveImageButton } from "@/components/SaveImageButton";
import { loadGames } from "@/lib/storage";
import { teamStats } from "@/lib/stats";
import type { ScoreBaseGame } from "@/lib/types";

export function TeamsStatsClient() {
  const [games, setGames] = useState<ScoreBaseGame[]>([]);
  useEffect(() => setGames(loadGames()), []);
  const rows = teamStats(games);

  return (
    <PageShell title="チーム成績" lead="保存済み試合からチームごとの勝敗、得点、打撃指標を集計します。">
      <div className="space-y-5">
        <SaveImageButton targetId="teams-output" filename="score-base-teams.png" />
        <section id="teams-output" className="overflow-x-auto rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black text-stone-950">チーム成績カード</h2>
          <table className="mt-3 w-max min-w-full text-sm">
            <thead><tr className="bg-stone-100"><th className="p-2 text-left">チーム</th><th>試合数</th><th>勝</th><th>敗</th><th>分</th><th>勝率</th><th>得点</th><th>失点</th><th>安打</th><th>本塁打</th><th>チーム打率</th><th>チームOPS</th><th>チーム防御率</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.team} className="border-t border-stone-100"><th className="p-2 text-left">{row.team}</th><td>{row.games}</td><td>{row.wins}</td><td>{row.losses}</td><td>{row.draws}</td><td>{row.winRate}</td><td>{row.runs}</td><td>{row.allowed}</td><td>{row.hits}</td><td>{row.hr}</td><td>{row.avg}</td><td>{row.ops}</td><td>{row.era}</td></tr>)}</tbody>
          </table>
          {rows.length === 0 ? <p className="mt-6 text-sm font-bold text-stone-500">保存済み試合がまだありません。</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
