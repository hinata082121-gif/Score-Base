"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { acceptInvitationAction } from "@/app/actions/invitations";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";

type InviteInfo = {
  code: string;
  teamId: string;
  teamName: string;
  role: string;
  status: string;
  expiresAt?: string;
};

export function InviteClient({ code, invitation, loggedIn }: { code: string; invitation?: InviteInfo | null; loggedIn: boolean }) {
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  if (!invitation) {
    return (
      <PageShell title="招待が見つかりません">
        <AccessStateCard title="招待を確認できません" message="招待コードが無効、または発行元のチームが削除されています。" href="/" actionLabel="トップへ戻る" />
      </PageShell>
    );
  }

  if (!loggedIn) {
    return (
      <PageShell title={`${invitation.teamName} への招待`}>
        <AccessStateCard title="ログインが必要です" message="招待を受けるにはログインまたは新規登録してください。" href={`/login?next=/invite/${code}`} actionLabel="ログイン" />
        <div className="mt-3">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 text-sm font-bold text-white" href="/register">新規登録</Link>
        </div>
      </PageShell>
    );
  }

  const teamId = invitation.teamId;
  const expired = nowMs > 0 && invitation.status === "PENDING" && invitation.expiresAt ? new Date(invitation.expiresAt).getTime() < nowMs : false;

  function accept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = `/teams/${teamId}`;
    });
  }

  return (
    <PageShell title={`${invitation.teamName} への招待`} lead={`付与される権限: ${invitation.role}`}>
      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        {error ? <p className="mb-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        {invitation.status !== "PENDING" || expired ? (
          <AccessStateCard title="この招待は利用できません" message={expired ? "招待リンクの期限が切れています。" : `現在の状態: ${invitation.status}`} href="/teams" actionLabel="チーム一覧へ" />
        ) : (
          <>
            <p className="text-sm leading-6 text-stone-700">ログイン中のユーザーで、このチームに参加します。期限: {invitation.expiresAt ? invitation.expiresAt.slice(0, 10) : "無期限"}</p>
            <button disabled={isPending} className="mt-4 min-h-12 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50" type="button" onClick={accept}>招待を受ける</button>
          </>
        )}
      </section>
    </PageShell>
  );
}
