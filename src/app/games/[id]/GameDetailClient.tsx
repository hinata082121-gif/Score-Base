"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { modeLabels, statusLabels } from "@/lib/constants";
import { loadGame } from "@/lib/storage";
import { scoreFor } from "@/lib/stats";
import type { BallLogGame } from "@/lib/types";

export function GameDetailClient({ id }: { id: string }) {
  const [game, setGame] = useState<BallLogGame | null>(null);

  useEffect(() => {
    setGame(loadGame(id) ?? null);
  }, [id]);

  if (!game) {
    return <PageShell title="記録が見つかりません"><div className="rounded-md bg-white p-6 text-sm font-bold text-stone-600">ローカル保存に該当する記録がありません。</div></PageShell>;
  }

  const score = scoreFor(game);

  return (
    <PageShell title={`${game.awayTeamName || "ビジター"} vs ${game.homeTeamName || "ホーム"}`} lead={`${game.gameDate} / ${game.venue || "球場未入力"} / ${modeLabels[game.mode]}`}>
      <div className="space-y-4">
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <div><p className="text-xs font-bold text-stone-500">スコア</p><p className="text-2xl font-black text-stone-950">{score.away}-{score.home}</p></div>
          <div><p className="text-xs font-bold text-stone-500">試合状態</p><p className="font-black text-stone-950">{statusLabels[game.status]}</p></div>
          <div><p className="text-xs font-bold text-stone-500">応援</p><p className="font-black text-stone-950">{game.favoriteTeamName || "-"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">MVP</p><p className="font-black text-stone-950">{game.mvp || "-"}</p></div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-black text-stone-950">観戦メモ</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-stone-500">大会</dt><dd>{game.competition || "-"}</dd></div>
            <div><dt className="font-bold text-stone-500">天気</dt><dd>{game.weather || "-"}</dd></div>
            <div><dt className="font-bold text-stone-500">座席</dt><dd>{game.seatMemo || "-"}</dd></div>
            <div><dt className="font-bold text-stone-500">印象に残った選手</dt><dd>{game.impressivePlayer || "-"}</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold text-stone-500">メモ</dt><dd className="whitespace-pre-wrap leading-6">{game.watchMemo || "-"}</dd></div>
          </dl>
        </section>
        {game.mode !== "WATCH_ONLY" ? (
          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-black text-stone-950">簡易記録</h2>
            <div className="overflow-x-auto">
              <table className="w-max min-w-full text-sm">
                <thead><tr><th className="p-2 text-left">攻撃</th>{game.inningScores.map((inning) => <th key={inning.inning} className="p-2">{inning.inning}</th>)}<th className="p-2">R</th></tr></thead>
                <tbody>
                  <tr><th className="p-2 text-left">{game.awayTeamName}</th>{game.inningScores.map((inning) => <td key={inning.inning} className="p-2 text-center">{inning.top || 0}</td>)}<td className="p-2 text-center font-black">{score.away}</td></tr>
                  <tr><th className="p-2 text-left">{game.homeTeamName}</th>{game.inningScores.map((inning) => <td key={inning.inning} className="p-2 text-center">{inning.bottom || 0}</td>)}<td className="p-2 text-center font-black">{score.home}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">勝利投手: {game.winningPitcher || "-"} / 敗戦投手: {game.losingPitcher || "-"} / セーブ: {game.savePitcher || "-"}</p>
          </section>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/edit`}>編集</Link>
          {game.mode === "SCOREBOOK" ? <Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/scorebook`}>スコアブック表示</Link> : null}
          <Link className="rounded-md bg-amber-600 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/export`}>出力画面</Link>
        </div>
      </div>
    </PageShell>
  );
}
