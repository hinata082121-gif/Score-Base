"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deleteGameAction, duplicateGameAction } from "@/app/actions/games";
import { CsvDownloadButton } from "@/components/CsvButtons";
import { exportGamesCsv } from "@/lib/repositories/csv";
import { deleteGame, duplicateLocalGame, loadGames } from "@/lib/storage";
import { modeLabels, statusLabels } from "@/lib/constants";
import { scoreFor } from "@/lib/stats";
import type { ScoreBaseGame } from "@/lib/types";

type ListedGame = ScoreBaseGame & { storage: "DB" | "LOCAL" };

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

export function GamesListClient({ dbGames, dbEnabled }: { dbGames: ScoreBaseGame[]; dbEnabled: boolean }) {
  const router = useRouter();
  const [games, setGames] = useState<ListedGame[]>(dbGames.map((game) => ({ ...game, storage: "DB" })));
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sort, setSort] = useState("new");
  const customDateError = period === "custom" && (!start || !end) ? "カスタム期間では開始日と終了日を入力してください。" : "";

  useEffect(() => {
    const localGames = loadGames().map((game): ListedGame => ({ ...game, storage: "LOCAL" }));
    setGames([...dbGames.map((game): ListedGame => ({ ...game, storage: "DB" })), ...localGames]);
    setReady(true);
  }, [dbGames]);

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
    const target = games.find((game) => game.id === id);
    if (target?.storage === "DB") {
      startTransition(async () => {
        const result = await deleteGameAction(id);
        if (!result.ok) setMessage(result.error);
        else router.refresh();
      });
      return;
    }
    deleteGame(id);
    setGames((items) => items.filter((game) => game.id !== id));
  }

  function duplicate(id: string) {
    const target = games.find((game) => game.id === id);
    if (target?.storage === "DB") {
      startTransition(async () => {
        const result = await duplicateGameAction(id);
        if (result.ok && result.id) router.push(`/games/${result.id}/edit`);
        else if (!result.ok) setMessage(result.error);
      });
      return;
    }
    const copy = duplicateLocalGame(id);
    setGames((items) => [...items, ...loadGames().filter((game) => !items.some((item) => item.id === game.id)).map((game): ListedGame => ({ ...game, storage: "LOCAL" }))]);
    if (copy) router.push(`/games/${copy.id}/edit`);
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 sm:col-span-4">
          {dbEnabled ? "ログイン中: DB保存済みデータとローカル保存データを分けて表示します。" : "未ログイン: ゲストモードとしてローカル保存データのみ表示します。DB保存にはログインしてください。"}
        </div>
        {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-4">{message}</p> : null}
        <label className="text-sm font-bold text-stone-700">期間<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={period} onChange={(e) => setPeriod(e.target.value)}><option value="all">全期間</option><option value="today">今日</option><option value="week">今週</option><option value="month">今月</option><option value="year">今年</option><option value="custom">カスタム期間</option></select></label>
        <label className="text-sm font-bold text-stone-700">開始日<input className={`mt-1 min-h-11 w-full rounded-md border px-3 ${customDateError && !start ? "border-red-300 bg-red-50" : "border-stone-300"}`} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="text-sm font-bold text-stone-700">終了日<input className={`mt-1 min-h-11 w-full rounded-md border px-3 ${customDateError && !end ? "border-red-300 bg-red-50" : "border-stone-300"}`} type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label className="text-sm font-bold text-stone-700">ソート<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">新しい順</option><option value="old">古い順</option><option value="venue">球場順</option><option value="team">チーム名順</option></select></label>
        {customDateError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-4">{customDateError}</p> : null}
        <div className="sm:col-span-4">
          <CsvDownloadButton filename={`score-base-games-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.csv`} getCsv={() => exportGamesCsv(filtered)} label="観戦記録CSV" />
        </div>
      </section>

      <section className="space-y-3">
        {!ready ? <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-bold text-stone-500">観戦記録を読み込み中です。</div> : null}
        {filtered.map((game) => {
          const score = scoreFor(game);
          return (
            <article key={game.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-emerald-700">{game.gameDate} / {modeLabels[game.mode]} / {game.storage === "DB" ? "DB保存" : "ローカル保存"}</p>
                  <h2 className="mt-1 text-lg font-black text-stone-950">{game.awayTeamName || "ビジター"} vs {game.homeTeamName || "ホーム"}</h2>
                  <p className="text-sm text-stone-600">{game.venue || "球場未入力"} / {statusLabels[game.status]} / {score.away}-{score.home}</p>
                  <p className="mt-1 text-sm text-stone-600">応援: {game.favoriteTeamName || "-"} / 勝敗: {game.result || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white" href={`/games/${game.id}`}>詳細</Link>
                  <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/games/${game.id}/edit`}>編集</Link>
                  <button disabled={isPending} className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 disabled:opacity-50" onClick={() => duplicate(game.id)}>複製</button>
                  {game.mode === "SCOREBOOK" ? <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/games/${game.id}/scorebook`}>スコアブック</Link> : null}
                  <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/games/${game.id}/export`}>PNG出力</Link>
                  <button disabled={isPending} className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50" onClick={() => remove(game.id)}>削除</button>
                </div>
              </div>
            </article>
          );
        })}
        {ready && filtered.length === 0 ? <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-bold text-stone-500">条件に合う観戦記録がありません。</div> : null}
      </section>
    </div>
  );
}
