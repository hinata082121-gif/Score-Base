"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { loadGames } from "@/lib/storage";
import { playerStats } from "@/lib/stats";
import { loadPlayer, PlayerMaster } from "@/lib/masterStorage";

type DbPlayerDetail = PlayerMaster & {
  storage: "DB";
  visibility: string;
  canEdit: boolean;
  canDelete: boolean;
  roleLabel: string;
  statsSummary: {
    plateAppearances: number;
    hits: number;
    rbi: number;
    pitchingAppearances: number;
    games: number;
  };
  recentAppearances: Array<{ game: string; result: string }>;
};

type PlayerDetail = (PlayerMaster & { storage?: "LOCAL" }) | DbPlayerDetail;

function safeInternalPath(path: string, fallback: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function PlayerDetailClient({ id, initialDbPlayer, returnTo = "" }: { id: string; initialDbPlayer?: DbPlayerDetail | null; returnTo?: string }) {
  const [player, setPlayer] = useState<PlayerDetail | null>(initialDbPlayer ?? null);
  const [stats, setStats] = useState<ReturnType<typeof playerStats>[number] | null>(null);
  const [appearances, setAppearances] = useState<Array<{ game: string; result: string }>>([]);
  const [ready, setReady] = useState(Boolean(initialDbPlayer));
  const backHref = safeInternalPath(returnTo, "/players");

  useEffect(() => {
    if (initialDbPlayer) {
      setPlayer(initialDbPlayer);
      setStats(null);
      setAppearances(initialDbPlayer.recentAppearances);
      setReady(true);
      return;
    }
    const current = loadPlayer(id) ?? null;
    setPlayer(current ? { ...current, storage: "LOCAL" } : null);
    setReady(true);
    if (!current) return;
    const games = loadGames();
    setStats(playerStats(games).find((row) => row.name === current.name) ?? null);
    setAppearances(games.flatMap((game) => game.plateAppearances.filter((pa) => pa.batterName === current.name).map((pa) => ({ game: `${game.awayTeamName} vs ${game.homeTeamName}`, result: pa.result }))));
  }, [id, initialDbPlayer]);

  if (!ready) return <PageShell title="選手"><div className="rounded-md bg-white p-6">読み込み中です。</div></PageShell>;
  if (!player) return <PageShell title="選手が見つかりません"><Link className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white" href="/players">選手一覧へ</Link></PageShell>;
  const isDbPlayer = player.storage === "DB";
  const editHref = `/players/${id}/edit${returnTo ? `?returnTo=${encodeURIComponent(backHref)}` : ""}`;

  return (
    <PageShell title={player.name} lead={`${player.teamName || "未所属"} / #${player.number || "-"}`}>
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-stone-700">投: {player.throwingHand} / 打: {player.battingSide} / 主守備: {player.primaryPosition || "-"}</p>
          <p className="mt-2 text-sm text-stone-700">{player.memo || "メモはありません。"}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-md bg-stone-100 px-3 py-2 text-stone-700">{isDbPlayer ? "DB保存" : "ローカル保存"}</span>
            {isDbPlayer ? <span className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">権限: {player.roleLabel}</span> : null}
            {isDbPlayer && !player.canEdit ? <span className="rounded-md bg-stone-50 px-3 py-2 text-stone-500">閲覧のみ</span> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(isDbPlayer ? player.canEdit : true) ? <Link className="inline-flex rounded-md bg-stone-900 px-4 py-3 text-sm font-bold text-white" href={editHref}>編集</Link> : null}
            {player.teamId ? <Link className="inline-flex rounded-md bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800" href={`/teams/${player.teamId}`}>チーム詳細</Link> : null}
            <Link className="inline-flex rounded-md bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800" href={backHref}>戻る</Link>
          </div>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">打者成績</h2>
          {isDbPlayer ? (
            player.statsSummary.plateAppearances > 0 ? <p className="mt-2 text-sm text-stone-700">打席 {player.statsSummary.plateAppearances} / 安打 {player.statsSummary.hits} / 打点 {player.statsSummary.rbi} / 出場試合 {player.statsSummary.games}</p> : <p className="mt-2 text-sm font-bold text-stone-500">成績集計対象がありません。</p>
          ) : stats ? <p className="mt-2 text-sm text-stone-700">打席 {stats.pa} / 安打 {stats.h} / 本塁打 {stats.hr} / 打点 {stats.rbi} / 打率 {stats.avg} / OPS {stats.ops}</p> : <p className="mt-2 text-sm font-bold text-stone-500">成績集計対象がありません。</p>}
          <p className="mt-3 rounded-md bg-stone-50 p-3 text-sm font-bold text-stone-600">投手成績は今後対応予定です。</p>
          {isDbPlayer ? <p className="mt-2 text-sm text-stone-600">投手関連打席: {player.statsSummary.pitchingAppearances}</p> : null}
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">関連PlateAppearance</h2>
          {appearances.map((appearance, index) => <p key={`${appearance.game}-${index}`} className="border-b border-stone-100 py-2 text-sm">{appearance.game} / {appearance.result}</p>)}
          {appearances.length === 0 ? <p className="mt-2 text-sm font-bold text-stone-500">出場試合・打席記録がありません。</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
