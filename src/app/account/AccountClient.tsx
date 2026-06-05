"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, onAuthChanged, type AuthUser } from "@/lib/auth/clientAuth";
import { loadPlayers, loadTeams } from "@/lib/masterStorage";
import { loadGames } from "@/lib/storage";
import { getUserTeamIds } from "@/lib/teamAccessStorage";

export function AccountClient() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(loadCurrentUser());
    refresh();
    return onAuthChanged(refresh);
  }, []);

  const teamCount = useMemo(() => {
    if (!user) return 0;
    const ids = getUserTeamIds(user.id);
    return loadTeams().filter((team) => ids.includes(team.id)).length;
  }, [user]);

  if (!user) {
    return (
      <PageShell title="アカウント">
        <AccessStateCard title="ログインが必要です" message="チーム共有、招待、権限管理を使うにはログインしてください。" href="/login?next=/account" actionLabel="ログイン" />
      </PageShell>
    );
  }

  return (
    <PageShell title="アカウント" lead="個人ワークスペース、チーム共有、ローカル保存データを確認します。">
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-stone-500">ログイン中</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">{user.displayName || user.name}</h2>
          <p className="mt-1 text-sm text-stone-600">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href="/account/settings">アカウント設定</Link>
            <Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href="/account/import-guest-data">未ログインデータ移行</Link>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">試合</p><p className="text-2xl font-black">{loadGames().length}</p></div>
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">チーム</p><p className="text-2xl font-black">{loadTeams().length}</p></div>
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">所属チーム</p><p className="text-2xl font-black">{teamCount}</p></div>
          <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-stone-500">選手</p><p className="text-2xl font-black">{loadPlayers().length}</p></div>
        </section>
      </div>
    </PageShell>
  );
}

