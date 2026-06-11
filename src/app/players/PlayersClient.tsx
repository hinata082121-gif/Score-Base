"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { deletePlayerAction } from "@/app/actions/players";
import { CsvDownloadButton } from "@/components/CsvButtons";
import { PageShell } from "@/components/PageShell";
import { exportPlayersCsv } from "@/lib/repositories/csv";
import { deletePlayerMaster, loadPlayers, loadTeams } from "@/lib/masterStorage";

type ListedPlayer = ReturnType<typeof loadPlayers>[number] & { storage: "DB" | "LOCAL" };
type DbPlayerInput = Omit<ListedPlayer, "storage">;
type ListedTeam = { id: string; name: string };

export function PlayersClient({ dbPlayers, dbTeams, dbEnabled }: { dbPlayers: DbPlayerInput[]; dbTeams: ListedTeam[]; dbEnabled: boolean }) {
  const [players, setPlayers] = useState<ListedPlayer[]>(dbPlayers.map((player) => ({ ...player, storage: "DB" })));
  const [teams, setTeams] = useState<ListedTeam[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState("");

  const filtered = useMemo(() => players.filter((player) => {
    const matchesQuery = !query || `${player.name}${player.kana}${player.number}`.toLowerCase().includes(query.toLowerCase());
    const matchesTeam = !teamId || player.teamId === teamId;
    const matchesPosition = !position || player.primaryPosition === position;
    return matchesQuery && matchesTeam && matchesPosition;
  }), [players, query, teamId, position]);

  useEffect(() => {
    setPlayers([...dbPlayers.map((player) => ({ ...player, storage: "DB" as const })), ...loadPlayers().map((player) => ({ ...player, storage: "LOCAL" as const }))]);
    setTeams([...dbTeams, ...loadTeams()]);
    setReady(true);
  }, [dbPlayers, dbTeams]);

  function remove(id: string) {
    if (!window.confirm("この選手を削除しますか？")) return;
    const target = players.find((player) => player.id === id);
    if (target?.storage === "DB") {
      startTransition(async () => {
        const result = await deletePlayerAction(id);
        if (!result.ok) setMessage(result.error);
        else setPlayers((items) => items.filter((player) => player.id !== id));
      });
      return;
    }
    deletePlayerMaster(id);
    setPlayers((items) => items.filter((player) => player.id !== id));
  }

  return (
    <PageShell title="選手マスタ" lead="選手情報を登録し、スタメン・成績集計へつなげる土台です。">
      <div className="space-y-4">
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_160px_auto_auto_auto]">
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 sm:col-span-6">{dbEnabled ? "ログイン中: DB保存済み選手とローカル保存選手を表示します。" : "未ログイン: ローカル保存のみ利用できます。"}</p>
          {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-6">{message}</p> : null}
          <input className="min-h-11 rounded-md border border-stone-300 px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="選手名・ふりがな・背番号で検索" />
          <select className="min-h-11 rounded-md border border-stone-300 px-3" value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">全チーム</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
          <input className="min-h-11 rounded-md border border-stone-300 px-3" value={position} onChange={(event) => setPosition(event.target.value)} placeholder="守備位置" />
          <CsvDownloadButton filename={`score-base-players-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.csv`} getCsv={() => exportPlayersCsv(players)} />
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href="/players/import">CSV取込</Link>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href="/players/new">新規選手登録</Link>
        </section>
        <section className="space-y-3">
          {!ready ? <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center text-sm font-bold text-stone-500">選手を読み込み中です。</div> : null}
          {filtered.map((player) => (
            <article key={player.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-emerald-700">{player.teamName || "未所属"} / #{player.number || "-"} / {player.storage === "DB" ? "DB保存" : "ローカル保存"}</p>
                  <h2 className="mt-1 text-lg font-black text-stone-950">{player.name}</h2>
                  <p className="text-sm text-stone-600">投: {player.throwingHand} / 打: {player.battingSide} / 守備: {player.primaryPosition || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white" href={`/players/${player.id}`}>詳細</Link>
                  <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/players/${player.id}/edit`}>編集</Link>
                  <button disabled={isPending} className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50" onClick={() => remove(player.id)}>削除</button>
                </div>
              </div>
            </article>
          ))}
          {ready && filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="font-bold text-stone-600">選手が未登録、または条件に一致しません。</p>
              <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href="/players/new">選手を登録する</Link>
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
