"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlayerAction, updatePlayerAction } from "@/app/actions/players";
import { PageShell } from "@/components/PageShell";
import { loadPlayer, loadTeams, upsertPlayer } from "@/lib/masterStorage";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

type PlayerFormState = {
  teamId: string;
  name: string;
  kana: string;
  number: string;
  throwingHand: "RIGHT" | "LEFT" | "BOTH" | "UNKNOWN";
  battingSide: "RIGHT" | "LEFT" | "SWITCH" | "UNKNOWN";
  primaryPosition: string;
  memo: string;
};
type TeamOption = { id: string; name: string };

export function PlayerFormClient({ id, dbEnabled = false, dbTeams = [], initialPlayer }: { id?: string; dbEnabled?: boolean; dbTeams?: TeamOption[]; initialPlayer?: PlayerFormState }) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [form, setForm] = useState<PlayerFormState>(initialPlayer ?? { teamId: "", name: "", kana: "", number: "", throwingHand: "UNKNOWN", battingSide: "UNKNOWN", primaryPosition: "", memo: "" });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTeams([...dbTeams, ...loadTeams()]);
    if (initialPlayer) return;
    if (!id) {
      const teamId = new URLSearchParams(window.location.search).get("teamId") ?? "";
      setForm((current) => ({ ...current, teamId }));
      return;
    }
    const player = loadPlayer(id);
    if (player) setForm({ teamId: player.teamId, name: player.name, kana: player.kana, number: player.number, throwingHand: player.throwingHand, battingSide: player.battingSide, primaryPosition: player.primaryPosition, memo: player.memo });
  }, [id, dbTeams, initialPlayer]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("選手名は必須です。");
      return;
    }
    if (dbEnabled) {
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        const result = id ? await updatePlayerAction(id, formData) : await createPlayerAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/players/${result.id ?? id}`);
        router.refresh();
      });
      return;
    }
    const player = upsertPlayer({ id, ...form, name: form.name.trim(), createdAt: id ? loadPlayer(id)?.createdAt : undefined });
    router.push(`/players/${player.id}`);
  }

  return (
    <PageShell title={id ? "選手編集" : "新規選手登録"}>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900 sm:col-span-2">{dbEnabled ? "DBへ保存します。チーム所属選手はTeamMember roleで権限確認します。" : "未ログインのためローカル保存します。"}</p>
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{error}</p> : null}
        <label className="text-sm font-bold text-stone-700">所属チーム<select name="teamId" className={field} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}><option value="">未所属</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
        <label className="text-sm font-bold text-stone-700">選手名 必須<input name="name" className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">ふりがな<input name="kana" className={field} value={form.kana} onChange={(event) => setForm({ ...form, kana: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">背番号<input name="number" className={field} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">投<select name="throwingHand" className={field} value={form.throwingHand} onChange={(event) => setForm({ ...form, throwingHand: event.target.value as typeof form.throwingHand })}><option value="RIGHT">右</option><option value="LEFT">左</option><option value="BOTH">両</option><option value="UNKNOWN">不明</option></select></label>
        <label className="text-sm font-bold text-stone-700">打<select name="battingSide" className={field} value={form.battingSide} onChange={(event) => setForm({ ...form, battingSide: event.target.value as typeof form.battingSide })}><option value="RIGHT">右</option><option value="LEFT">左</option><option value="SWITCH">両</option><option value="UNKNOWN">不明</option></select></label>
        <label className="text-sm font-bold text-stone-700">主守備位置<input name="primaryPosition" className={field} value={form.primaryPosition} onChange={(event) => setForm({ ...form, primaryPosition: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700 sm:col-span-2">メモ<textarea name="memo" className={`${field} min-h-28`} value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} /></label>
        <button disabled={isPending} className="min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2" type="submit">保存</button>
      </form>
    </PageShell>
  );
}
