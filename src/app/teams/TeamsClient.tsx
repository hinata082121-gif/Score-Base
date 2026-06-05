"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { deleteTeamMaster, loadPlayers, loadTeams, TeamCategory } from "@/lib/masterStorage";

const categoryLabels: Record<TeamCategory, string> = {
  professional: "プロ",
  college: "大学",
  high_school: "高校",
  amateur: "社会人・草野球",
  youth: "少年野球",
  other: "その他",
  "": "未設定",
};

export function TeamsClient() {
  const [teams, setTeams] = useState(() => loadTeams());
  const [players] = useState(() => loadPlayers());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TeamCategory>("");

  const filtered = useMemo(() => teams.filter((team) => {
    const matchesQuery = !query || `${team.name}${team.shortName}${team.homeGround}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || team.category === category;
    return matchesQuery && matchesCategory;
  }), [teams, query, category]);

  function remove(id: string) {
    if (!window.confirm("このチームを削除しますか？所属選手は未所属になります。")) return;
    deleteTeamMaster(id);
    setTeams(loadTeams());
  }

  return (
    <PageShell title="チームマスタ" lead="チーム情報を登録し、選手・試合記録へ紐付けるための土台です。">
      <div className="space-y-4">
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto]">
          <input className="min-h-11 rounded-md border border-stone-300 px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="チーム名・略称・本拠地で検索" />
          <select className="min-h-11 rounded-md border border-stone-300 px-3" value={category} onChange={(event) => setCategory(event.target.value as TeamCategory)}>
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{value ? label : "全カテゴリ"}</option>)}
          </select>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href="/teams/new">新規チーム作成</Link>
        </section>
        <section className="space-y-3">
          {filtered.map((team) => {
            const playerCount = players.filter((player) => player.teamId === team.id).length;
            return (
              <article key={team.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: team.primaryColor || "#166534" }} />
                      <h2 className="text-lg font-black text-stone-950">{team.name}</h2>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">略称: {team.shortName || "-"} / {categoryLabels[team.category]} / 本拠地: {team.homeGround || "-"}</p>
                    <p className="mt-1 text-sm text-stone-600">所属選手: {playerCount}人 / 作成日: {team.createdAt.slice(0, 10)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white" href={`/teams/${team.id}`}>詳細</Link>
                    <Link className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-800" href={`/teams/${team.id}/edit`}>編集</Link>
                    <button className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" onClick={() => remove(team.id)}>削除</button>
                  </div>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="font-bold text-stone-600">チームが未登録、または条件に一致しません。</p>
              <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href="/teams/new">チームを作成する</Link>
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
