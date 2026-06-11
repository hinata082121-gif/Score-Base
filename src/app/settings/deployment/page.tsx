import { headers } from "next/headers";
import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth/session";
import { deploymentEnvChecks, publicBaseUrl } from "@/lib/deployment";
import { databaseUrlSourceLabel, resolveDatabaseUrl } from "@/lib/db/databaseUrl";
import { getPrisma } from "@/lib/db/prisma";
import { deploymentErrorGuidance } from "@/lib/errorGuidance";
import { buildShareUrl, sameUrlHost } from "@/lib/url";

type QueryablePrisma = {
  $queryRawUnsafe?: (query: string) => Promise<unknown>;
};

async function checkPrisma() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl.url) {
    return {
      status: "未実行",
      message: "DATABASE_URLまたはVercel SupabaseのPostgreSQL URLが未設定のため接続チェックをスキップしました。",
      guidance: deploymentErrorGuidance("DATABASE_URL"),
      source: databaseUrlSourceLabel(databaseUrl.source),
    };
  }
  try {
    const prisma = await getPrisma() as QueryablePrisma;
    if (prisma.$queryRawUnsafe) await prisma.$queryRawUnsafe("SELECT 1");
    return { status: "成功", message: "Prisma接続を確認しました。", guidance: "", source: databaseUrlSourceLabel(databaseUrl.source) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prisma接続に失敗しました。";
    return { status: "失敗", message, guidance: deploymentErrorGuidance(message), source: databaseUrlSourceLabel(databaseUrl.source) };
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
  const authUrlMatchesCurrentHost = currentUrl !== "取得できません" ? sameUrlHost(baseUrl, currentUrl) : true;
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
          <p className="mt-2 text-sm font-bold text-stone-700">想定DB: PostgreSQL / Supabase</p>
          <p className="mt-1 text-sm font-bold text-stone-700">接続元: {prisma.source}</p>
          <p className="mt-2 text-sm font-bold text-stone-700">結果: {prisma.status}</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">{prisma.message}</p>
          {prisma.guidance ? <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">{prisma.guidance}</p> : null}
          <p className="mt-3 text-sm font-bold leading-6 text-stone-700">本番DBのmigration状態は、ProductionのDATABASE_URLへPOSTGRES_PRISMA_URLを設定した後に `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` で確認・適用してください。</p>
        </section>
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold text-stone-500">NODE_ENV</p><p className="mt-1 text-sm font-bold text-stone-800">{process.env.NODE_ENV || "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">VERCEL_ENV</p><p className="mt-1 text-sm font-bold text-stone-800">{process.env.VERCEL_ENV || "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">VERCEL_URL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{process.env.VERCEL_URL ? "設定済み" : "未設定"}</p></div>
          <div><p className="text-xs font-bold text-stone-500">現在のアプリURL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{currentUrl}</p></div>
          <div><p className="text-xs font-bold text-stone-500">public base URL</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{baseUrl}</p></div>
          <div><p className="text-xs font-bold text-stone-500">招待リンク生成例</p><p className="mt-1 break-all text-sm font-bold text-stone-800">{buildShareUrl("/invite/example-code")}</p></div>
          <div><p className="text-xs font-bold text-stone-500">最終確認日時</p><p className="mt-1 text-sm font-bold text-stone-800">{new Date().toISOString()}</p></div>
        </section>
        {!authUrlMatchesCurrentHost ? (
          <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-black text-amber-950">Auth URL確認</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-amber-900">現在のアプリURLとpublic base URLのホストが一致していません。Vercelの本番ドメインと `NEXTAUTH_URL` / `AUTH_URL` が一致しているか確認し、必要なら再デプロイしてください。</p>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
