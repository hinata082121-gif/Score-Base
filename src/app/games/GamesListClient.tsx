"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteGame, loadGames } from "@/lib/storage";
import { modeLabels, statusLabels } from "@/lib/constants";
import { scoreFor } from "@/lib/stats";

function inPeriod(dateText: string, period: string, start: string, end: string) {
  const date = new Date(dateText);
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (period === "all") return true;
  if (period === "today") return date >= startOfDay;
  if (period === "week") {
    const week = new Date(startOfDay);
    week.setDate(week.getDate() - 7);
    return date >= week;
  }
  if (period === "month") return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  if (period === "year") return date.getFullYear() === today.getFullYear();
  if (period === "custom") return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
  return true;
}

export function GamesListClient() {
  const [games, setGames] = useState(() => loadGames());
  const [period, setPeriod] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sort, setSort] = useState("new");
  const customDateError = period === "custom" && (!start || !end) ? "カスタム期間では開始日と終了日を入力してください。" : "";

  const filtered = useMemo(() => {
    if (period === "custom" && (!start || !end)) return [];
    const rows = games.filter((game) => inPeriod(game.gameDate, period, start, end));
    rows.sort((a, b) => {
      if (sort === "old") return a.gameDate.localeCompare(b.gameDate);
      if (sort === "venue") return a.venue.localeCompare(b.venue);
      if (sort === "team") return `${a.awayTeamName}${a.homeTeamName}`.localeCompare(`${b.awayTeamName}${b.homeTeamName}`);
      return b.gameDate.localeCompare(a.gameDate);
    });
    return rows;
  }, [games, period, start, end, sort]);

  function remove(id: string) {
    if (!window.confirm("この観戦記録を削除しますか？")) return;
    deleteGame(id);
    setGames(loadGames());
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <label className="text-sm font-bold text-stone-700">期間<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={period} onChange={(e) => setPeriod(e.target.value)}><option value="all">全期間</option><option value="today">今日</option><option value="week">今週</option><option value="month">今月</option><option value="year">今年</option><option value="custom">カスタム期間</option></select></label>
        <label className="text-sm font-bold text-stone-700">開始日<input className={`mt-1 min-h-11 w-full rounded-md border px-3 ${customDateError && !start ? "border-red-300 bg-red-50" : "border-stone-300"}`} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="text-sm font-bold text-stone-700">終了日<input className={`mt-1 min-h-11 w-full rounded-md border px-3 ${customDateError && !end ? "border-red-300 bg-red-50" : "border-stone-300"}`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label className="text-sm font-bold text-stone-700">ソート<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">新しい順</option><option value="old">古い順</option><option value="venue">球場順</option><option value="team">チーム名順</option></select></label>
        {customDateError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-4">{customDateError}</p> : null}
      </section>

      <section className="space-y-3">
        {filtered.map((game) => {
          const score = scoreFor(game);
          return (
            <article key={game.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-emerald-700">{game.gameDate} / {modeLabels[game.mode]}</p>
                  <h2 className="mt-1 text-lg font-black text-stone-950">{game.awayTeamName || "ビジター"} vs {game.homeTeamName || "ホーム"}</h2>
                  <p className="text-sm text-stone-600">{game.venue || "球場未入力"} / {statusLabels[game.status]} / {score.away}-{score.home}</p>
                  <p className="mt-1 text-sm text-stone-600">応援: {game.favoriteTeamName || "-"} / 勝敗: {game.result || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white" href={`/games/${game.id}`}>詳細</Link>
                  <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/games/${game.id}/edit`}>編集</Link>
                  <button className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" onClick={() => remove(game.id)}>削除</button>
                </div>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 ? <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-bold text-stone-500">条件に合う観戦記録がありません。</div> : null}
      </section>
    </div>
  );
}
