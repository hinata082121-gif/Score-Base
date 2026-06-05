"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createSessionAction } from "@/app/actions/auth";
import { PageShell } from "@/components/PageShell";
import { loginUser } from "@/lib/auth/clientAuth";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const result = await loginUser(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await createSessionAction({ id: result.user.id, email: result.user.email, name: result.user.displayName || result.user.name });
    router.push(params.get("next") || "/account");
  }

  return (
    <PageShell title="ログイン" lead="Score Baseのアカウントで、個人ワークスペースとチーム共有を切り替えます。">
      <form onSubmit={submit} className="mx-auto grid max-w-md gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        <label className="text-sm font-bold text-stone-700">メールアドレス<input className={field} type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">パスワード<input className={field} type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        <button className="min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-60" type="submit" disabled={saving}>{saving ? "ログイン中" : "ログイン"}</button>
        <p className="text-center text-sm text-stone-600">アカウントがない場合は <Link className="font-bold text-emerald-700" href="/register">新規登録</Link></p>
      </form>
    </PageShell>
  );
}
