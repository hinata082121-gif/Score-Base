"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, type AuthUser } from "@/lib/auth/clientAuth";
import { canManageTeam, type TeamRole } from "@/lib/auth/permissions";
import { loadTeam, type TeamMaster } from "@/lib/masterStorage";
import { getMemberRole, getTeamMembers, removeTeamMember, updateTeamMemberRole, type TeamMemberRecord } from "@/lib/teamAccessStorage";

const roles: TeamRole[] = ["OWNER", "ADMIN", "EDITOR", "SCORER", "VIEWER"];

export function TeamMembersClient({ id }: { id: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [team, setTeam] = useState<TeamMaster | null>(null);
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);

  function refresh() {
    setUser(loadCurrentUser());
    setTeam(loadTeam(id) ?? null);
    setMembers(getTeamMembers(id));
  }

  useEffect(refresh, [id]);

  const role = getMemberRole(id, user?.id);
  const manageable = canManageTeam(role);

  if (!team) return <PageShell title="チームが見つかりません"><AccessStateCard title="404 Not Found" message="指定されたチームは見つかりません。" href="/teams" actionLabel="チーム一覧へ" /></PageShell>;
  if (!user) return <PageShell title={`${team.name} メンバー`}><AccessStateCard title="ログインが必要です" message="メンバー管理を開くにはログインしてください。" href={`/login?next=/teams/${id}/members`} actionLabel="ログイン" /></PageShell>;
  if (!manageable) return <PageShell title={`${team.name} メンバー`}><AccessStateCard title="権限がありません" message="メンバー管理にはOWNERまたはADMIN権限が必要です。" href={`/teams/${id}`} actionLabel="チーム詳細へ" /></PageShell>;

  return (
    <PageShell title={`${team.name} メンバー`} lead="チーム共有の参加者と権限を管理します。">
      <div className="space-y-4">
        <section className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href={`/teams/${id}/invitations`}>招待を管理</Link>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href={`/teams/${id}`}>チーム詳細へ</Link>
        </section>
        <section className="grid gap-3">
          {members.map((member) => (
            <div key={member.id} className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-black text-stone-950">{member.name}</p>
                <p className="text-sm text-stone-600">{member.email}</p>
              </div>
              <select
                className="min-h-11 rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700"
                value={member.role}
                disabled={member.role === "OWNER"}
                onChange={(event) => {
                  updateTeamMemberRole(member.id, event.target.value as TeamRole);
                  refresh();
                }}
              >
                {roles.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button
                className="min-h-11 rounded-md bg-red-50 px-4 text-sm font-bold text-red-700 disabled:opacity-50"
                type="button"
                disabled={member.role === "OWNER"}
                onClick={() => {
                  removeTeamMember(member.id);
                  refresh();
                }}
              >
                削除
              </button>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}

