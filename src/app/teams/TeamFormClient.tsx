"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeamAction, updateTeamAction } from "@/app/actions/teams";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser } from "@/lib/auth/clientAuth";
import { loadTeam, TeamCategory, upsertTeam } from "@/lib/masterStorage";
import { ensureTeamOwner } from "@/lib/teamAccessStorage";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function TeamFormClient({ id, dbEnabled = false, initialTeam }: { id?: string; dbEnabled?: boolean; initialTeam?: { name: string; shortName: string; category: TeamCategory; homeGround: string; primaryColor: string; memo: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(initialTeam ?? { name: "", shortName: "", category: "" as TeamCategory, homeGround: "", primaryColor: "#166534", memo: "" });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialTeam) return;
    if (!id) return;
    const team = loadTeam(id);
    if (team) setForm({ name: team.name, shortName: team.shortName, category: team.category, homeGround: team.homeGround, primaryColor: team.primaryColor, memo: team.memo });
  }, [id, initialTeam]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("チーム名は必須です。");
      return;
    }
    if (dbEnabled) {
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        const result = id ? await updateTeamAction(id, formData) : await createTeamAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/teams/${result.id ?? id}`);
        router.refresh();
      });
      return;
    }
    const team = upsertTeam({ id, ...form, name: form.name.trim(), createdAt: id ? loadTeam(id)?.createdAt : undefined });
    ensureTeamOwner(team.id, loadCurrentUser());
    router.push(`/teams/${team.id}`);
  }

  return (
    <PageShell title={id ? "チーム編集" : "新規チーム作成"}>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900 sm:col-span-2">{dbEnabled ? "DBへ保存します。作成時はOWNER権限も保存されます。" : "未ログインのためローカル保存します。"}</p>
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{error}</p> : null}
        <label className="text-sm font-bold text-stone-700">チーム名 必須<input name="name" className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">略称<input name="shortName" className={field} value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">カテゴリ<select name="category" className={field} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TeamCategory })}><option value="">未設定</option><option value="professional">プロ</option><option value="college">大学</option><option value="high_school">高校</option><option value="amateur">社会人・草野球</option><option value="youth">少年野球</option><option value="other">その他</option></select></label>
        <label className="text-sm font-bold text-stone-700">本拠地<input name="homeGround" className={field} value={form.homeGround} onChange={(event) => setForm({ ...form, homeGround: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">チームカラー<input name="primaryColor" className={`${field} h-12`} type="color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700 sm:col-span-2">メモ<textarea name="memo" className={`${field} min-h-28`} value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} /></label>
        <button disabled={isPending} className="min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2" type="submit">保存</button>
      </form>
    </PageShell>
  );
}
