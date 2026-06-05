"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadText } from "@/components/CsvButtons";
import { PageShell } from "@/components/PageShell";
import { loadPlayers, loadTeams, savePlayers, saveTeams } from "@/lib/masterStorage";
import { loadGames, saveGames } from "@/lib/storage";

export function DataSettingsClient() {
  const [, setVersion] = useState(0);
  const counts = {
    games: loadGames().length,
    teams: loadTeams().length,
    players: loadPlayers().length,
  };

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
    setVersion((value) => value + 1);
  }

  return (
    <PageShell title="データ管理" lead="localStorage仮保存のバックアップとDB移行準備を行います。">
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">現在の保存方式</h2>
          <p className="mt-2 text-sm text-stone-700">MVP画面操作はlocalStorage保存です。DB保存用のPrisma schema / repository / Server Actionsは追加済みです。</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">試合</p><p className="text-2xl font-black">{counts.games}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">チーム</p><p className="text-2xl font-black">{counts.teams}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-bold text-stone-500">選手</p><p className="text-2xl font-black">{counts.players}</p></div>
          </div>
        </section>
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-black text-amber-950">DB保存へ移行する前に</h2>
          <p className="mt-2 text-sm font-bold text-amber-900">DATABASE_URLとPrisma Client生成が必要です。未設定の場合、DB保存処理はエラーになります。移行前に必ずJSONバックアップを保存してください。</p>
        </section>
        <section className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <button className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" onClick={backup}>JSONバックアップ</button>
          <button className="min-h-11 rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" onClick={() => window.alert("DB移行ボタンは土台実装です。DATABASE_URL設定後、Server Actions経由の移行処理を接続してください。")}>DB保存へ移行</button>
          <button className="min-h-11 rounded-md bg-red-50 px-4 text-sm font-bold text-red-700" onClick={clearLocalData}>localStorageデータ削除</button>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-white px-4 text-sm font-bold text-stone-800 ring-1 ring-stone-300" href="/settings">設定へ戻る</Link>
        </section>
      </div>
    </PageShell>
  );
}
