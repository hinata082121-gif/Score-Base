"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { loadCurrentUser, type AuthUser } from "@/lib/auth/clientAuth";
import { loadTeam, type TeamMaster } from "@/lib/masterStorage";
import { acceptInvitation, loadInvitationByCode, type TeamInvitationRecord } from "@/lib/teamAccessStorage";

export function InviteClient({ code }: { code: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [invitation, setInvitation] = useState<TeamInvitationRecord | null>(null);
  const [team, setTeam] = useState<TeamMaster | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentInvitation = loadInvitationByCode(code) ?? null;
    setUser(loadCurrentUser());
    setInvitation(currentInvitation);
    setTeam(currentInvitation ? loadTeam(currentInvitation.teamId) ?? null : null);
  }, [code]);

  if (!invitation || !team) {
    return (
      <PageShell title="招待が見つかりません">
        <AccessStateCard title="招待を確認できません" message="招待コードが無効、または発行元のチームが削除されています。" href="/" actionLabel="トップへ戻る" />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title={`${team.name} への招待`}>
        <AccessStateCard title="ログインが必要です" message="招待を受けるにはログインまたは新規登録してください。" href={`/login?next=/invite/${code}`} actionLabel="ログイン" />
        <div className="mt-3">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 text-sm font-bold text-white" href="/register">新規登録</Link>
        </div>
      </PageShell>
    );
  }

  function accept() {
    if (!user) return;
    const result = acceptInvitation(code, user);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = `/teams/${result.teamId}`;
  }

  return (
    <PageShell title={`${team.name} への招待`} lead={`付与される権限: ${invitation.role}`}>
      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        {error ? <p className="mb-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        <p className="text-sm leading-6 text-stone-700">{user.displayName || user.name} として、このチームに参加します。</p>
        <button className="mt-4 min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" type="button" onClick={accept}>招待を受ける</button>
      </section>
    </PageShell>
  );
}
