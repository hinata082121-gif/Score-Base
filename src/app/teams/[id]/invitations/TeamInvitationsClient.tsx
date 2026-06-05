"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, type AuthUser } from "@/lib/auth/clientAuth";
import { canManageTeam, type TeamRole } from "@/lib/auth/permissions";
import { loadTeam, type TeamMaster } from "@/lib/masterStorage";
import { createTeamInvitation, getMemberRole, getTeamInvitations, revokeInvitation, type TeamInvitationRecord } from "@/lib/teamAccessStorage";

const roles: TeamRole[] = ["ADMIN", "EDITOR", "SCORER", "VIEWER"];
const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function TeamInvitationsClient({ id }: { id: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [team, setTeam] = useState<TeamMaster | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitationRecord[]>([]);
  const [form, setForm] = useState({ email: "", role: "VIEWER" as TeamRole });
  const [message, setMessage] = useState("");

  function refresh() {
    setUser(loadCurrentUser());
    setTeam(loadTeam(id) ?? null);
    setInvitations(getTeamInvitations(id));
  }

  useEffect(refresh, [id]);

  const role = getMemberRole(id, user?.id);
  const manageable = canManageTeam(role);

  function invite(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    const invitation = createTeamInvitation({ teamId: id, email: form.email, role: form.role, createdById: user.id });
    const url = `${window.location.origin}/invite/${invitation.code}`;
    void navigator.clipboard?.writeText(url);
    setMessage("招待リンクを作成しました。対応ブラウザではクリップボードにもコピーしています。");
    setForm({ email: "", role: "VIEWER" });
    refresh();
  }

  if (!team) return <PageShell title="チームが見つかりません"><AccessStateCard title="404 Not Found" message="指定されたチームは見つかりません。" href="/teams" actionLabel="チーム一覧へ" /></PageShell>;
  if (!user) return <PageShell title={`${team.name} 招待`}><AccessStateCard title="ログインが必要です" message="招待管理を開くにはログインしてください。" href={`/login?next=/teams/${id}/invitations`} actionLabel="ログイン" /></PageShell>;
  if (!manageable) return <PageShell title={`${team.name} 招待`}><AccessStateCard title="権限がありません" message="招待管理にはOWNERまたはADMIN権限が必要です。" href={`/teams/${id}`} actionLabel="チーム詳細へ" /></PageShell>;

  return (
    <PageShell title={`${team.name} 招待`} lead="メール送信は行わず、共有用の招待リンクを発行します。">
      <div className="space-y-4">
        <form onSubmit={invite} className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_160px_auto] sm:items-end">
          {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-800 sm:col-span-3">{message}</p> : null}
          <label className="text-sm font-bold text-stone-700">招待先メール<input className={field} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="任意" /></label>
          <label className="text-sm font-bold text-stone-700">権限<select className={field} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as TeamRole })}>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" type="submit">招待作成</button>
        </form>
        <section className="grid gap-3">
          {invitations.map((invitation) => {
            const url = typeof window !== "undefined" ? `${window.location.origin}/invite/${invitation.code}` : `/invite/${invitation.code}`;
            return (
              <div key={invitation.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-auto text-sm font-bold text-stone-700">{invitation.email || "メール未指定"} / {invitation.role} / {invitation.status}</p>
                  <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-stone-100 px-3 text-xs font-bold text-stone-800" type="button" onClick={() => void navigator.clipboard?.writeText(url)}>
                    <Copy size={14} aria-hidden="true" />
                    コピー
                  </button>
                  {invitation.status === "PENDING" ? <button className="min-h-10 rounded-md bg-red-50 px-3 text-xs font-bold text-red-700" type="button" onClick={() => { revokeInvitation(invitation.id); refresh(); }}>無効化</button> : null}
                </div>
                <p className="mt-2 break-all rounded-md bg-stone-50 p-2 text-xs font-bold text-stone-600">{url}</p>
              </div>
            );
          })}
          {invitations.length === 0 ? <p className="rounded-md border border-stone-200 bg-white p-4 text-sm font-bold text-stone-500 shadow-sm">招待はまだありません。</p> : null}
        </section>
        <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href={`/teams/${id}/members`}>メンバー管理へ</Link>
      </div>
    </PageShell>
  );
}

