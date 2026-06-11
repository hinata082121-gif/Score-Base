"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGameAction, duplicateGameAction } from "@/app/actions/games";
import { CsvDownloadButton } from "@/components/CsvButtons";
import { PageShell } from "@/components/PageShell";
import { ShareButton } from "@/components/ShareButton";
import { modeLabels, statusLabels } from "@/lib/constants";
import { exportPlateAppearancesCsv } from "@/lib/repositories/csv";
import { deleteGame, duplicateLocalGame, loadGame } from "@/lib/storage";
import { scoreFor } from "@/lib/stats";
import type { ScoreBaseGame } from "@/lib/types";

export function GameDetailClient({ id, initialGame, dbEnabled = false }: { id: string; initialGame?: ScoreBaseGame | null; dbEnabled?: boolean }) {
  const router = useRouter();
  const [game, setGame] = useState<ScoreBaseGame | null>(initialGame ?? null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialGame) return;
    setGame(loadGame(id) ?? null);
  }, [id, initialGame]);

  if (!game) {
    return <PageShell title="記録が見つかりません"><div className="rounded-md bg-white p-6 text-sm font-bold text-stone-600">ローカル保存に該当する記録がありません。</div></PageShell>;
  }

  const score = scoreFor(game);
  const shareText = `Score Baseで記録しました\n${game.awayTeamName} vs ${game.homeTeamName}\n${game.gameDate} / ${game.venue || "-"}\n${score.away} - ${score.home}\n#ScoreBase #野球観戦記録`;

  function duplicate() {
    if (!game) return;
    if (dbEnabled) {
      startTransition(async () => {
        const result = await duplicateGameAction(game.id);
        if (result.ok && result.id) router.push(`/games/${result.id}/edit`);
        else if (!result.ok) setMessage(result.error);
      });
      return;
    }
    const copy = duplicateLocalGame(game.id);
    if (copy) router.push(`/games/${copy.id}/edit`);
  }

  function remove() {
    if (!game) return;
    if (!window.confirm("この試合記録を削除しますか？")) return;
    if (dbEnabled) {
      startTransition(async () => {
        const result = await deleteGameAction(game.id);
        if (result.ok) router.push("/games");
        else setMessage(result.error);
      });
      return;
    }
    deleteGame(game.id);
    router.push("/games");
  }

  return (
    <PageShell title={`${game.awayTeamName || "ビジター"} vs ${game.homeTeamName || "ホーム"}`} lead={`${game.gameDate} / ${game.venue || "球場未入力"} / ${modeLabels[game.mode]}`}>
      <div className="space-y-4">
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          {message ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-4">{message}</p> : null}
          <div className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900 sm:col-span-4">{dbEnabled ? "DB保存済み" : "ローカル保存"}</div>
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
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">記録管理</h2>
          <p className="mt-2 text-sm text-stone-600">スタメン {game.players.length}件 / 打席記録 {game.plateAppearances.length}件</p>
        </section>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/edit`}>編集</Link>
          <button disabled={isPending} className="rounded-md bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 disabled:opacity-50" onClick={duplicate}>複製</button>
          <button disabled={isPending} className="rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:opacity-50" onClick={remove}>削除</button>
          {game.mode === "SCOREBOOK" ? <Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/scorebook`}>スコアブック表示</Link> : null}
          <Link className="rounded-md bg-amber-600 px-4 py-3 text-sm font-bold text-white" href={`/games/${game.id}/export`}>出力画面</Link>
          <CsvDownloadButton filename={`score-base-scorebook-${game.id}.csv`} getCsv={() => exportPlateAppearancesCsv(game)} label="スコアブックCSV" />
          <ShareButton text={shareText} url={typeof window !== "undefined" ? window.location.href : undefined} />
        </div>
      </div>
    </PageShell>
  );
}
