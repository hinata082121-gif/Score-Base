"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, logoutUser, updateCurrentUser, type AuthUser } from "@/lib/auth/clientAuth";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function AccountSettingsClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const current = loadCurrentUser();
    setUser(current);
    setDisplayName(current?.displayName || current?.name || "");
  }, []);

  if (!user) {
    return (
      <PageShell title="アカウント設定">
        <AccessStateCard title="ログインが必要です" message="アカウント設定を開くにはログインしてください。" href="/login?next=/account/settings" actionLabel="ログイン" />
      </PageShell>
    );
  }

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const next = updateCurrentUser({ displayName, name: displayName });
    setUser(next);
    setMessage("プロフィールを保存しました。");
  }

  function logout() {
    logoutUser();
    void logoutAction().finally(() => {
      window.location.href = "/login";
    });
  }

  return (
    <PageShell title="アカウント設定" lead="表示名、ログアウト、ローカルデータ移行の導線を管理します。">
      <div className="space-y-4">
        <form onSubmit={saveProfile} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p> : null}
          <label className="text-sm font-bold text-stone-700">表示名<input className={field} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <p className="text-sm text-stone-600">メールアドレス: {user.email}</p>
          <button className="min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" type="submit">保存</button>
        </form>
        <section className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href="/settings/data">データ管理</Link>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href="/account/import-guest-data">未ログインデータ移行</Link>
          <button className="min-h-11 rounded-md bg-red-50 px-4 text-sm font-bold text-red-700" type="button" onClick={logout}>ログアウト</button>
        </section>
      </div>
    </PageShell>
  );
}
