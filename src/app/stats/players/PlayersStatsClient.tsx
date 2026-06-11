"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SaveImageButton } from "@/components/SaveImageButton";
import { loadGames } from "@/lib/storage";
import { pitcherStats, playerStats } from "@/lib/stats";
import type { ScoreBaseGame } from "@/lib/types";

export function PlayersStatsClient({ dbGames, dbEnabled }: { dbGames: ScoreBaseGame[]; dbEnabled: boolean }) {
  const [games, setGames] = useState<ScoreBaseGame[]>(dbGames);
  useEffect(() => setGames([...dbGames, ...loadGames()]), [dbGames]);
  const batters = playerStats(games);
  const pitchers = pitcherStats(games);

  return (
    <PageShell title="個人成績" lead="詳細記録・簡易記録から、MVP向けの打者/投手成績を集計します。">
      <div className="space-y-5">
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">{dbEnabled ? "DB保存済みデータとローカル保存データを集計しています。" : "ローカル保存データを集計しています。"}</p>
        <SaveImageButton targetId="players-output" filename="score-base-players.png" />
        <section id="players-output" className="overflow-x-auto rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black text-stone-950">打者成績</h2>
          <table className="mt-3 w-max min-w-full text-sm">
            <thead><tr className="bg-stone-100"><th className="p-2 text-left">選手</th><th>試合</th><th>打席</th><th>打数</th><th>安打</th><th>二塁打</th><th>三塁打</th><th>本塁打</th><th>打点</th><th>得点</th><th>四球</th><th>死球</th><th>三振</th><th>盗塁</th><th>打率</th><th>出塁率</th><th>長打率</th><th>OPS</th></tr></thead>
            <tbody>{batters.map((row) => <tr key={row.name} className="border-t border-stone-100"><th className="p-2 text-left">{row.name}</th><td>{row.games}</td><td>{row.pa}</td><td>{row.ab}</td><td>{row.h}</td><td>{row.doubles}</td><td>{row.triples}</td><td>{row.hr}</td><td>{row.rbi}</td><td>{row.runs}</td><td>{row.bb}</td><td>{row.hbp}</td><td>{row.so}</td><td>{row.sb}</td><td>{row.avg}</td><td>{row.obp}</td><td>{row.slg}</td><td>{row.ops}</td></tr>)}</tbody>
          </table>
          <h2 className="mt-8 text-xl font-black text-stone-950">投手成績</h2>
          <table className="mt-3 w-max min-w-full text-sm">
            <thead><tr className="bg-stone-100"><th className="p-2 text-left">投手</th><th>登板</th><th>投球回</th><th>被安打</th><th>奪三振</th><th>与四球</th><th>失点</th><th>自責点</th><th>防御率</th><th>勝敗S</th></tr></thead>
            <tbody>{pitchers.map((row) => <tr key={row.name} className="border-t border-stone-100"><th className="p-2 text-left">{row.name}</th><td>{row.games}</td><td>{row.innings}</td><td>{row.h}</td><td>{row.so}</td><td>{row.bb}</td><td>{row.runs}</td><td>{row.er}</td><td>{row.era}</td><td>手動入力</td></tr>)}</tbody>
          </table>
          {batters.length === 0 && pitchers.length === 0 ? <p className="mt-6 text-sm font-bold text-stone-500">打席記録がまだありません。</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
