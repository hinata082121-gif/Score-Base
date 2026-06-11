"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export function PlayerFormClient({ id }: { id?: string }) {
  const router = useRouter();
  const [teams, setTeams] = useState<ReturnType<typeof loadTeams>>([]);
  const [form, setForm] = useState<PlayerFormState>({ teamId: "", name: "", kana: "", number: "", throwingHand: "UNKNOWN", battingSide: "UNKNOWN", primaryPosition: "", memo: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    setTeams(loadTeams());
    if (!id) {
      const teamId = new URLSearchParams(window.location.search).get("teamId") ?? "";
      setForm((current) => ({ ...current, teamId }));
      return;
    }
    const player = loadPlayer(id);
    if (player) setForm({ teamId: player.teamId, name: player.name, kana: player.kana, number: player.number, throwingHand: player.throwingHand, battingSide: player.battingSide, primaryPosition: player.primaryPosition, memo: player.memo });
  }, [id]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("選手名は必須です。");
      return;
    }
    const player = upsertPlayer({ id, ...form, name: form.name.trim(), createdAt: id ? loadPlayer(id)?.createdAt : undefined });
    router.push(`/players/${player.id}`);
  }

  return (
    <PageShell title={id ? "選手編集" : "新規選手登録"}>
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{error}</p> : null}
        <label className="text-sm font-bold text-stone-700">所属チーム<select className={field} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}><option value="">未所属</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
        <label className="text-sm font-bold text-stone-700">選手名 必須<input className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">ふりがな<input className={field} value={form.kana} onChange={(event) => setForm({ ...form, kana: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">背番号<input className={field} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700">投<select className={field} value={form.throwingHand} onChange={(event) => setForm({ ...form, throwingHand: event.target.value as typeof form.throwingHand })}><option value="RIGHT">右</option><option value="LEFT">左</option><option value="BOTH">両</option><option value="UNKNOWN">不明</option></select></label>
        <label className="text-sm font-bold text-stone-700">打<select className={field} value={form.battingSide} onChange={(event) => setForm({ ...form, battingSide: event.target.value as typeof form.battingSide })}><option value="RIGHT">右</option><option value="LEFT">左</option><option value="SWITCH">両</option><option value="UNKNOWN">不明</option></select></label>
        <label className="text-sm font-bold text-stone-700">主守備位置<input className={field} value={form.primaryPosition} onChange={(event) => setForm({ ...form, primaryPosition: event.target.value })} /></label>
        <label className="text-sm font-bold text-stone-700 sm:col-span-2">メモ<textarea className={`${field} min-h-28`} value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} /></label>
        <button className="min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white sm:col-span-2" type="submit">保存</button>
      </form>
    </PageShell>
  );
}
