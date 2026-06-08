import { headers } from "next/headers";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth/session";
import { deploymentEnvChecks, publicBaseUrl } from "@/lib/deployment";
import { getPrisma } from "@/lib/db/prisma";
import { deploymentErrorGuidance } from "@/lib/errorGuidance";

type QueryablePrisma = {
  $queryRawUnsafe?: (query: string) => Promise<unknown>;
};

async function checkPrisma() {
  if (!process.env.DATABASE_URL) {
    return {
      status: "未実行",
      message: "DATABASE_URLが未設定のため接続チェックをスキップしました。",
      guidance: deploymentErrorGuidance("DATABASE_URL"),
    };
  }
  try {
    const prisma = await getPrisma() as QueryablePrisma;
    if (prisma.$queryRawUnsafe) await prisma.$queryRawUnsafe("SELECT 1");
    return { status: "成功", message: "Prisma接続を確認しました。", guidance: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prisma接続に失敗しました。";
    return { status: "失敗", message, guidance: deploymentErrorGuidance(message) };
  }
}

export default async function DeploymentSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <PageShell title="公開環境診断">
        <AccessStateCard title="ログインが必要です" message="公開環境診断を表示するにはログインしてください。セッション期限切れの場合は再ログインしてください。" href="/login?next=/settings/deployment" actionLabel="ログイン" />
      </PageShell>
    );
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  const currentUrl = host ? `${proto}://${host}` : "取得できません";
  const baseUrl = publicBaseUrl();
  const prisma = await checkPrisma();
  const checks = deploymentEnvChecks();

  return (
    <PageShell title="公開環境診断" lead="Vercel公開前後に必要な環境変数とDB接続状態を確認します。秘密値は表示しません。">
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check.key} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-stone-500">{check.label}</p>
              <p className={`mt-1 text-lg font-black ${check.configured ? "text-emerald-700" : "text-red-700"}`}>{check.configured ? "設定済み" : "未設定"}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{check.help}</p>
            </div>
          ))}
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">Prisma接続</h2>
          <p className="mt-2 text-sm font-bold text-stone-700">結果: {prisma.status}</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">{prisma.message}</p>
          {prisma.guidance ? <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">{prisma.guidance}</p> : null}
        </section>
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold text-stone-500">NODE_ENV</p><p className="mt-1 text-sm font-bold text-stone-800">{process.env.NODE_ENV || "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">VERCEL_ENV</p><p className="mt-1 text-sm font-bold text-stone-800">{process.env.VERCEL_ENV || "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">VERCEL_URL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{process.env.VERCEL_URL ? "設定済み" : "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">現在のアプリURL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{currentUrl}</p></div>
          <div><p className="text-xs font-bold text-stone-500">共有URL生成時のbase URL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{baseUrl || currentUrl}</p></div>
          <div><p className="text-xs font-bold text-stone-500">最終確認日時</p><p className="mt-1 text-sm font-bold text-stone-800">{new Date().toISOString()}</p></div>
        </section>
      </div>
    </PageShell>
  );
}
