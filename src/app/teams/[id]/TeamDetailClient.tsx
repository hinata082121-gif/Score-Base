"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { loadGames } from "@/lib/storage";
import { loadPlayers, loadTeam, PlayerMaster, TeamMaster } from "@/lib/masterStorage";

type DbTeamDetail = TeamMaster & {
  storage: "DB";
  players: PlayerMaster[];
  gameCount: number;
  canManagePlayers?: boolean;
};

export function TeamDetailClient({ id, initialTeam }: { id: string; initialTeam?: DbTeamDetail | null }) {
  const [team, setTeam] = useState<(TeamMaster & { storage?: "DB" | "LOCAL" }) | null>(initialTeam ?? null);
  const [players, setPlayers] = useState<PlayerMaster[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const canManagePlayers = initialTeam?.canManagePlayers ?? team?.storage !== "DB";

  useEffect(() => {
    if (initialTeam) {
      setTeam(initialTeam);
      setPlayers(initialTeam.players);
      setGameCount(initialTeam.gameCount);
      return;
    }
    const current = loadTeam(id) ?? null;
    setTeam(current ? { ...current, storage: "LOCAL" } : null);
    setPlayers(loadPlayers().filter((player) => player.teamId === id));
    setGameCount(current ? loadGames().filter((game) => game.homeTeamName === current.name || game.awayTeamName === current.name).length : 0);
  }, [id, initialTeam]);

  if (!team) return <PageShell title="チームが見つかりません"><Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href="/teams">チーム一覧へ</Link></PageShell>;

  return (
    <PageShell title={team.name} lead={`${team.shortName || "略称なし"} / ${team.homeGround || "本拠地未設定"}`}>
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-700">{team.memo || "メモはありません。"}</p>
          <p className="mt-3 text-xs font-bold text-stone-500">{team.storage === "DB" ? "DB保存チーム" : "ローカル保存チーム"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={`/teams/${id}/edit`}>編集</Link>
            {canManagePlayers ? <Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href={`/players/new?teamId=${id}&returnTo=${encodeURIComponent(`/teams/${id}`)}`}>選手追加</Link> : <span className="rounded-md bg-stone-100 px-4 py-3 text-sm font-bold text-stone-500">選手編集不可</span>}
            <Link className="rounded-md bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800" href={`/teams/${id}/members`}>メンバー</Link>
            <Link className="rounded-md bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800" href={`/teams/${id}/invitations`}>招待</Link>
            <Link className="rounded-md bg-amber-600 px-4 py-3 text-sm font-bold text-white" href="/stats/teams">チーム成績</Link>
          </div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">選手一覧</h2>
          <div className="mt-3 grid gap-2">
            {players.map((player) => (
              <article key={player.id} className="rounded-md bg-stone-50 p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-900">#{player.number || "-"} {player.name}</p>
                    <p className="mt-1 font-bold text-stone-600">守備: {player.primaryPosition || "-"} / 投: {player.throwingHand || "UNKNOWN"} / 打: {player.battingSide || "UNKNOWN"}</p>
                    {player.memo ? <p className="mt-1 text-stone-600">{player.memo}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md bg-white px-3 py-2 text-xs font-bold text-stone-800 ring-1 ring-stone-200" href={`/players/${player.id}?returnTo=${encodeURIComponent(`/teams/${id}`)}`}>詳細</Link>
                    {canManagePlayers ? <Link className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white" href={`/players/${player.id}/edit?returnTo=${encodeURIComponent(`/teams/${id}`)}`}>編集</Link> : <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-stone-500 ring-1 ring-stone-200">閲覧のみ</span>}
                  </div>
                </div>
              </article>
            ))}
            {players.length === 0 ? <p className="text-sm font-bold text-stone-500">選手が未登録です。</p> : null}
          </div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">関連試合</h2>
          <p className="mt-2 text-sm text-stone-600">関連試合数: {gameCount}</p>
        </section>
      </div>
    </PageShell>
  );
}
