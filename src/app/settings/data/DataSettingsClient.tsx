"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createGameAction } from "@/app/actions/games";
import { createPlayerAction } from "@/app/actions/players";
import { createTeamAction } from "@/app/actions/teams";
import { downloadText } from "@/components/CsvButtons";
import { PageShell } from "@/components/PageShell";
import { loadPlayers, loadTeams, savePlayers, saveTeams } from "@/lib/masterStorage";
import { loadGames, saveGames } from "@/lib/storage";

export function DataSettingsClient() {
  const [counts, setCounts] = useState({ games: 0, teams: 0, players: 0 });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function refreshCounts() {
    setCounts({ games: loadGames().length, teams: loadTeams().length, players: loadPlayers().length });
  }

  useEffect(() => {
    refreshCounts();
  }, []);

  function backup() {
    const data = {
      exportedAt: new Date().toISOString(),
      games: loadGames(),
      teams: loadTeams(),
      players: loadPlayers(),
    };
    downloadText(`score-base-backup-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  }

  function clearLocalData() {
    if (!window.confirm("localStorageのScore Baseデータを削除しますか？事前にJSONバックアップを推奨します。")) return;
    saveGames([]);
    saveTeams([]);
    savePlayers([]);
    refreshCounts();
  }

  function migrateToDb() {
    if (!window.confirm("ローカル保存データをDBへコピーします。重複する可能性があるため、先にJSONバックアップを保存してください。移行後もlocalStorageは自動削除しません。")) return;
    startTransition(async () => {
      let ok = 0;
      let failed = 0;
      setMessage("DB移行中です。");
      for (const team of loadTeams()) {
        const formData = new FormData();
        Object.entries(team).forEach(([key, value]) => formData.set(key, String(value ?? "")));
        const result = await createTeamAction(formData);
        if (result.ok) ok += 1; else failed += 1;
      }
      for (const player of loadPlayers()) {
        const formData = new FormData();
        Object.entries(player).forEach(([key, value]) => formData.set(key, String(value ?? "")));
        const result = await createPlayerAction(formData);
        if (result.ok) ok += 1; else failed += 1;
      }
      for (const game of loadGames()) {
        const formData = new FormData();
        formData.set("payloadJson", JSON.stringify(game));
        const result = await createGameAction(formData);
        if (result.ok) ok += 1; else failed += 1;
      }
      setMessage(`DB移行を実行しました。成功 ${ok}件 / 失敗 ${failed}件。localStorageは削除していません。`);
    });
  }

  return (
    <PageShell title="データ管理" lead="localStorage仮保存のバックアップとDB移行準備を行います。">
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">現在の保存方式</h2>
          <p className="mt-2 text-sm text-stone-700">ログイン済みユーザーの主要CRUDはDB保存を標準にし、localStorageはゲスト/一時保存/移行元として扱います。</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">試合</p><p className="text-2xl font-black">{counts.games}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">チーム</p><p className="text-2xl font-black">{counts.teams}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">選手</p><p className="text-2xl font-black">{counts.players}</p></div>
          </div>
        </section>
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-black text-amber-950">DB保存へ移行する前に</h2>
          <p className="mt-2 text-sm font-bold text-amber-900">PostgreSQLのDATABASE_URLとPrisma Client生成が必要です。Vercel Supabase連携ではPOSTGRES_PRISMA_URLをDATABASE_URLへコピーしてください。移行前に必ずJSONバックアップを保存してください。</p>
        </section>
        <section className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          {message ? <p className="basis-full rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{message}</p> : null}
          <button className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" onClick={backup}>JSONバックアップ</button>
          <button disabled={isPending} className="min-h-11 rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800 disabled:opacity-50" onClick={migrateToDb}>DB保存へ移行</button>
          <button className="min-h-11 rounded-md bg-red-50 px-4 text-sm font-bold text-red-700" onClick={clearLocalData}>localStorageデータ削除</button>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-white px-4 text-sm font-bold text-stone-800 ring-1 ring-stone-300" href="/settings">設定へ戻る</Link>
        </section>
      </div>
    </PageShell>
  );
}
