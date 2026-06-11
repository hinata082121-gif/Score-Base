"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { removeTeamMemberAction, updateMemberRoleAction } from "@/app/actions/teamMembers";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { canManageTeam, type TeamRole } from "@/lib/auth/permissions";

const roles: TeamRole[] = ["OWNER", "ADMIN", "EDITOR", "SCORER", "VIEWER"];

type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
};

export function TeamMembersClient({ id, teamName, currentRole, members }: { id: string; teamName?: string; currentRole?: TeamRole | null; members: MemberRow[] }) {
  const [rows, setRows] = useState(members);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const manageable = canManageTeam(currentRole ?? undefined);

  if (!teamName) return <PageShell title="チームが見つかりません"><AccessStateCard title="404 Not Found" message="指定されたチームは見つかりません。" href="/teams" actionLabel="チーム一覧へ" /></PageShell>;
  if (!currentRole) return <PageShell title={`${teamName} メンバー`}><AccessStateCard title="権限がありません" message="チームメンバーのみ閲覧できます。" href={`/teams/${id}`} actionLabel="チーム詳細へ" /></PageShell>;

  function changeRole(memberUserId: string, role: TeamRole) {
    if (!window.confirm(`${role}へ変更しますか？`)) return;
    startTransition(async () => {
      const result = await updateMemberRoleAction(id, memberUserId, role);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setRows((items) => items.map((item) => item.userId === memberUserId ? { ...item, role } : item));
      setMessage("ロールを更新しました。");
    });
  }

  function remove(member: MemberRow) {
    if (!window.confirm(`${member.name || member.email} をチームから削除しますか？`)) return;
    startTransition(async () => {
      const result = await removeTeamMemberAction(id, member.userId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setRows((items) => items.filter((item) => item.userId !== member.userId));
      setMessage("メンバーを削除しました。");
    });
  }

  return (
    <PageShell title={`${teamName} メンバー`} lead={`あなたの権限: ${currentRole}`}>
      <div className="space-y-4">
        <section className="flex flex-wrap gap-2 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          {message ? <p className="basis-full rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{message}</p> : null}
          {!manageable ? <p className="basis-full rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-900">閲覧専用です。メンバー管理はOWNERまたはADMINのみ可能です。</p> : null}
          <Link className="inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href={`/teams/${id}/invitations`}>招待を管理</Link>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href={`/teams/${id}`}>チーム詳細へ</Link>
        </section>
        <section className="grid gap-3">
          {rows.map((member) => {
            const lockedOwner = member.role === "OWNER";
            return (
              <div key={member.id} className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-black text-stone-950">{member.name || "名前未設定"}</p>
                  <p className="text-sm text-stone-600">{member.email || "-"} / 参加日 {member.joinedAt.slice(0, 10)}</p>
                </div>
                <select
                  className="min-h-11 rounded-md border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700"
                  value={member.role}
                  disabled={!manageable || lockedOwner || isPending}
                  onChange={(event) => changeRole(member.userId, event.target.value as TeamRole)}
                >
                  {roles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <button
                  className="min-h-11 rounded-md bg-red-50 px-4 text-sm font-bold text-red-700 disabled:opacity-50"
                  type="button"
                  disabled={!manageable || lockedOwner || isPending}
                  onClick={() => remove(member)}
                >
                  削除
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </PageShell>
  );
}
