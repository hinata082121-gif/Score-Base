"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createInvitationAction, revokeInvitationAction } from "@/app/actions/invitations";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { canManageTeam, type TeamRole } from "@/lib/auth/permissions";

const roles: TeamRole[] = ["ADMIN", "EDITOR", "SCORER", "VIEWER"];
const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

type InvitationRow = {
  id: string;
  email: string;
  code: string;
  role: TeamRole;
  status: string;
  createdAt: string;
  acceptedAt: string;
};

export function TeamInvitationsClient({ id, teamName, currentRole, invitations }: { id: string; teamName?: string; currentRole?: TeamRole | null; invitations: InvitationRow[] }) {
  const [rows, setRows] = useState(invitations);
  const [origin, setOrigin] = useState("");
  const [form, setForm] = useState({ email: "", role: "VIEWER" as TeamRole });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const manageable = canManageTeam(currentRole ?? undefined);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!teamName) return <PageShell title="チームが見つかりません"><AccessStateCard title="404 Not Found" message="指定されたチームは見つかりません。" href="/teams" actionLabel="チーム一覧へ" /></PageShell>;
  if (!manageable) return <PageShell title={`${teamName} 招待`}><AccessStateCard title="権限がありません" message="招待管理にはOWNERまたはADMIN権限が必要です。" href={`/teams/${id}`} actionLabel="チーム詳細へ" /></PageShell>;

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createInvitationAction(id, form.role, form.email || undefined);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (result.url) await navigator.clipboard?.writeText(result.url);
      setMessage("招待リンクを作成しました。対応ブラウザではクリップボードにもコピーしています。");
      setForm({ email: "", role: "VIEWER" });
      window.location.reload();
    });
  }

  function revoke(invitationId: string) {
    startTransition(async () => {
      const result = await revokeInvitationAction(id, invitationId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setRows((items) => items.map((item) => item.id === invitationId ? { ...item, status: "REVOKED" } : item));
      setMessage("招待を無効化しました。");
    });
  }

  return (
    <PageShell title={`${teamName} 招待`} lead="DB保存の招待リンクを発行し、受諾状態を記録します。">
      <div className="space-y-4">
        <form onSubmit={invite} className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_160px_auto] sm:items-end">
          {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-800 sm:col-span-3">{message}</p> : null}
          <label className="text-sm font-bold text-stone-700">招待先メール<input className={field} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="任意" /></label>
          <label className="text-sm font-bold text-stone-700">権限<select className={field} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as TeamRole })}>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button disabled={isPending} className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50" type="submit">招待作成</button>
        </form>
        <section className="grid gap-3">
          {rows.map((invitation) => {
            const url = origin ? `${origin}/invite/${invitation.code}` : `/invite/${invitation.code}`;
            return (
              <div key={invitation.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-auto text-sm font-bold text-stone-700">{invitation.email || "メール未指定"} / {invitation.role} / {invitation.status}</p>
                  <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-stone-100 px-3 text-xs font-bold text-stone-800" type="button" onClick={() => void navigator.clipboard?.writeText(url)}>
                    <Copy size={14} aria-hidden="true" />
                    コピー
                  </button>
                  {invitation.status === "PENDING" ? <button disabled={isPending} className="min-h-10 rounded-md bg-red-50 px-3 text-xs font-bold text-red-700 disabled:opacity-50" type="button" onClick={() => revoke(invitation.id)}>無効化</button> : null}
                </div>
                <p className="mt-2 break-all rounded-md bg-stone-50 p-2 text-xs font-bold text-stone-600">{url}</p>
                <p className="mt-2 text-xs font-bold text-stone-500">作成 {invitation.createdAt.slice(0, 10)} / 受諾 {invitation.acceptedAt ? invitation.acceptedAt.slice(0, 10) : "-"}</p>
              </div>
            );
          })}
          {rows.length === 0 ? <p className="rounded-md border border-stone-200 bg-white p-4 text-sm font-bold text-stone-500 shadow-sm">招待はまだありません。</p> : null}
        </section>
        <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href={`/teams/${id}/members`}>メンバー管理へ</Link>
      </div>
    </PageShell>
  );
}
