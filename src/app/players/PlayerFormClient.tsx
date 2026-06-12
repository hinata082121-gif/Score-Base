"use client";

import Link from "next/link";
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
type CreatedPlayer = {
  id: string;
  name: string;
  number?: string | null;
  primaryPosition?: string | null;
  teamId?: string | null;
  teamName?: string | null;
};

function safePath(path: string, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}

const emptyForm: PlayerFormState = { teamId: "", name: "", kana: "", number: "", throwingHand: "UNKNOWN", battingSide: "UNKNOWN", primaryPosition: "", memo: "" };

export function PlayerFormClient({ id, dbEnabled = false, dbTeams = [], initialPlayer, initialTeamId = "", returnTo = "" }: { id?: string; dbEnabled?: boolean; dbTeams?: TeamOption[]; initialPlayer?: PlayerFormState; initialTeamId?: string; returnTo?: string }) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [form, setForm] = useState<PlayerFormState>(initialPlayer ?? { ...emptyForm, teamId: initialTeamId });
  const [createdPlayer, setCreatedPlayer] = useState<CreatedPlayer | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedTeam = teams.find((team) => team.id === form.teamId);
  const fallbackPath = form.teamId ? `/teams/${form.teamId}` : "/players";
  const safeReturnTo = safePath(returnTo, fallbackPath);

  useEffect(() => {
    setTeams([...dbTeams, ...loadTeams()]);
    if (initialPlayer) return;
    if (!id) {
      setForm((current) => ({ ...current, teamId: initialTeamId || new URLSearchParams(window.location.search).get("teamId") || "" }));
      return;
    }
    const player = loadPlayer(id);
    if (player) setForm({ teamId: player.teamId, name: player.name, kana: player.kana, number: player.number, throwingHand: player.throwingHand, battingSide: player.battingSide, primaryPosition: player.primaryPosition, memo: player.memo });
  }, [id, dbTeams, initialPlayer, initialTeamId]);

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
        if (id) {
          router.push(safeReturnTo || `/players/${id}`);
          router.refresh();
          return;
        }
        setCreatedPlayer(result.player ?? { id: result.id ?? "", name: form.name, number: form.number, primaryPosition: form.primaryPosition, teamId: form.teamId, teamName: selectedTeam?.name ?? "" });
        setError("");
        router.refresh();
      });
      return;
    }
    const player = upsertPlayer({ id, ...form, name: form.name.trim(), createdAt: id ? loadPlayer(id)?.createdAt : undefined });
    if (id) {
      router.push(safeReturnTo || `/players/${player.id}`);
      return;
    }
    setCreatedPlayer({ id: player.id, name: player.name, number: player.number, primaryPosition: player.primaryPosition, teamId: player.teamId, teamName: player.teamName });
  }

  function continueCreate() {
    setCreatedPlayer(null);
    setError("");
    setForm({ ...emptyForm, teamId: form.teamId });
  }

  return (
    <PageShell title={id ? "選手編集" : "新規選手登録"}>
      {createdPlayer ? (
        <section className="space-y-4 rounded-md border border-emerald-200 bg-white p-4 shadow-sm">
          <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">選手を登録しました。</p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-black text-stone-500">選手名</p><p className="font-bold text-stone-950">{createdPlayer.name}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-black text-stone-500">所属チーム</p><p className="font-bold text-stone-950">{createdPlayer.teamName || selectedTeam?.name || "未所属"}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-black text-stone-500">背番号</p><p className="font-bold text-stone-950">{createdPlayer.number || "-"}</p></div>
            <div className="rounded-md bg-stone-50 p-3"><p className="text-xs font-black text-stone-500">守備位置</p><p className="font-bold text-stone-950">{createdPlayer.primaryPosition || "-"}</p></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-bold text-white" href={createdPlayer.teamId ? `/teams/${createdPlayer.teamId}` : "/players"}>チーム管理画面に戻る</Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href={`/players/${createdPlayer.id}/edit?returnTo=${encodeURIComponent(createdPlayer.teamId ? `/teams/${createdPlayer.teamId}` : "/players")}`}>登録した選手情報の修正</Link>
            <button type="button" className="min-h-11 rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" onClick={continueCreate}>続けて他の選手を登録</button>
          </div>
        </section>
      ) : <form onSubmit={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
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
      </form>}
    </PageShell>
  );
}
