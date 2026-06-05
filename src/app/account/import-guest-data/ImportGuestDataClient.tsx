"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, type AuthUser } from "@/lib/auth/clientAuth";
import { loadPlayers, loadTeams } from "@/lib/masterStorage";
import { loadGames } from "@/lib/storage";

export function ImportGuestDataClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const counts = { games: loadGames().length, teams: loadTeams().length, players: loadPlayers().length };

  useEffect(() => setUser(loadCurrentUser()), []);

  if (!user) {
    return (
      <PageShell title="未ログインデータ移行">
        <AccessStateCard title="ログインが必要です" message="ローカル保存データをアカウントに紐づけるにはログインしてください。" href="/login?next=/account/import-guest-data" actionLabel="ログイン" />
      </PageShell>
    );
  }

  return (
    <PageShell title="未ログインデータ移行" lead="現在のMVP画面はlocalStorage保存です。本番DB保存へ切り替える前にバックアップを作成してください。">
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">試合</p><p className="text-2xl font-black">{counts.games}</p></div>
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">チーム</p><p className="text-2xl font-black">{counts.teams}</p></div>
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">選手</p><p className="text-2xl font-black">{counts.players}</p></div>
        </section>
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-black text-amber-950">DB移行準備</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-amber-900">アカウント紐づけのServer ActionsはPrisma基盤に接続する前提で残しています。現段階ではJSONバックアップを作成し、本番DB接続後に移行処理を接続してください。</p>
          <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-amber-700 px-4 text-sm font-bold text-white" href="/settings/data">データ管理を開く</Link>
        </section>
      </div>
    </PageShell>
  );
}

