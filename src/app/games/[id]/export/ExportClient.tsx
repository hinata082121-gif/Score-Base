"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SaveImageButton } from "@/components/SaveImageButton";
import { ScorebookTable } from "@/components/ScorebookTable";
import { loadGame, loadGames, loadSettings } from "@/lib/storage";
import { playerStats, scoreFor, teamStats } from "@/lib/stats";
import type { ScoreBaseGame } from "@/lib/types";

function cardClass() {
  return "w-[760px] max-w-full rounded-md border border-stone-300 bg-white p-6 shadow-sm";
}

export function ExportClient({ id, initialGame, initialGames = [], dbEnabled = false }: { id: string; initialGame?: ScoreBaseGame | null; initialGames?: ScoreBaseGame[]; dbEnabled?: boolean }) {
  const [game, setGame] = useState<ScoreBaseGame | null>(initialGame ?? null);
  const [games, setGames] = useState<ScoreBaseGame[]>(initialGames);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!initialGame) setGame(loadGame(id) ?? null);
    setGames([...(initialGames ?? []), ...loadGames()]);
    setReady(true);
  }, [id, initialGame, initialGames]);

  if (!ready) return <PageShell title="出力画面"><div className="rounded-md bg-white p-6">読み込み中です。</div></PageShell>;
  if (!game) return <PageShell title="出力画面"><div className="rounded-md bg-white p-6">記録が見つかりません。</div></PageShell>;

  const score = scoreFor(game);
  const players = playerStats(games).slice(0, 6);
  const teams = teamStats(games).slice(0, 6);

  return (
    <PageShell title="出力画面" lead="各カードは固定幅で余白を確保し、PNGとして保存できます。">
      <div className="space-y-8">
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">{dbEnabled ? "DB保存済みデータから出力しています。" : "ローカル保存データから出力しています。"}</p>
        <section className="space-y-3 overflow-x-auto">
          <SaveImageButton targetId="watch-card" filename="score-base-watch-card.png" />
          <div id="watch-card" className={cardClass()}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Score Base</p>
            <h2 className="mt-2 text-3xl font-black text-stone-950">{game.awayTeamName} vs {game.homeTeamName}</h2>
            <p className="mt-1 text-base font-bold text-stone-600">{game.gameDate} / {game.venue} / {game.competition}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-stone-100 p-4"><p className="text-xs font-bold text-stone-500">スコア</p><p className="text-3xl font-black">{score.away}-{score.home}</p></div>
              <div className="rounded-md bg-emerald-50 p-4"><p className="text-xs font-bold text-stone-500">応援</p><p className="text-xl font-black">{game.favoriteTeamName || "-"}</p></div>
              <div className="rounded-md bg-amber-50 p-4"><p className="text-xs font-bold text-stone-500">MVP</p><p className="text-xl font-black">{game.mvp || "-"}</p></div>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-base leading-7 text-stone-700">{game.watchMemo || "観戦メモなし"}</p>
          </div>
        </section>

        <section className="space-y-3 overflow-x-auto">
          <SaveImageButton targetId="simple-score-card" filename="score-base-simple-score.png" />
          <div id="simple-score-card" className={cardClass()}>
            <h2 className="text-2xl font-black text-stone-950">簡易スコアカード</h2>
            <table className="mt-4 w-full text-sm">
              <thead><tr><th className="p-2 text-left">TEAM</th>{game.inningScores.map((inning) => <th key={inning.inning} className="p-2">{inning.inning}</th>)}<th className="p-2">R</th></tr></thead>
              <tbody>
                <tr><th className="p-2 text-left">{game.awayTeamName}</th>{game.inningScores.map((inning) => <td key={inning.inning} className="p-2 text-center">{inning.top || 0}</td>)}<td className="p-2 text-center font-black">{score.away}</td></tr>
                <tr><th className="p-2 text-left">{game.homeTeamName}</th>{game.inningScores.map((inning) => <td key={inning.inning} className="p-2 text-center">{inning.bottom || 0}</td>)}<td className="p-2 text-center font-black">{score.home}</td></tr>
              </tbody>
            </table>
            <p className="mt-4 text-sm text-stone-700">勝利投手 {game.winningPitcher || "-"} / 敗戦投手 {game.losingPitcher || "-"} / セーブ {game.savePitcher || "-"}</p>
            <p className="mt-2 text-sm text-stone-700">本塁打 {game.homerunMemo || "-"}</p>
          </div>
        </section>

        {game.mode === "SCOREBOOK" ? <ScorebookTable game={game} style={loadSettings().defaultStyle} /> : null}

        <section className="space-y-3 overflow-x-auto">
          <SaveImageButton targetId="player-stats-card" filename="score-base-player-stats.png" />
          <div id="player-stats-card" className={cardClass()}>
            <h2 className="text-2xl font-black text-stone-950">個人成績カード</h2>
            <table className="mt-4 w-full text-sm"><thead><tr><th className="p-2 text-left">選手</th><th>試合</th><th>安打</th><th>本塁打</th><th>打点</th><th>打率</th><th>OPS</th></tr></thead><tbody>{players.map((row) => <tr key={row.name}><th className="p-2 text-left">{row.name}</th><td className="text-center">{row.games}</td><td className="text-center">{row.h}</td><td className="text-center">{row.hr}</td><td className="text-center">{row.rbi}</td><td className="text-center">{row.avg}</td><td className="text-center">{row.ops}</td></tr>)}</tbody></table>
          </div>
        </section>

        <section className="space-y-3 overflow-x-auto">
          <SaveImageButton targetId="team-stats-card" filename="score-base-team-stats.png" />
          <div id="team-stats-card" className={cardClass()}>
            <h2 className="text-2xl font-black text-stone-950">チーム成績カード</h2>
            <table className="mt-4 w-full text-sm"><thead><tr><th className="p-2 text-left">チーム</th><th>試合</th><th>勝</th><th>敗</th><th>得点</th><th>安打</th><th>本塁打</th><th>勝率</th><th>OPS</th></tr></thead><tbody>{teams.map((row) => <tr key={row.team}><th className="p-2 text-left">{row.team}</th><td className="text-center">{row.games}</td><td className="text-center">{row.wins}</td><td className="text-center">{row.losses}</td><td className="text-center">{row.runs}</td><td className="text-center">{row.hits}</td><td className="text-center">{row.hr}</td><td className="text-center">{row.winRate}</td><td className="text-center">{row.ops}</td></tr>)}</tbody></table>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
