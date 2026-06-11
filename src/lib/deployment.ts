import { getPublicAppUrl } from "@/lib/url";
import { databaseUrlSourceLabel, resolveDatabaseUrl } from "@/lib/db/databaseUrl";

export type DeploymentCheck = {
  key: string;
  label: string;
  configured: boolean;
  help: string;
};

export function deploymentEnvChecks(): DeploymentCheck[] {
  const databaseUrl = resolveDatabaseUrl();
  return [
    {
      key: "DATABASE_URL",
      label: "DATABASE_URL",
      configured: Boolean(process.env.DATABASE_URL),
      help: "Prismaが接続するDB URLです。Supabase連携時はPOSTGRES_PRISMA_URLの値をコピーして設定することを推奨します。",
    },
    {
      key: "POSTGRES_PRISMA_URL",
      label: "POSTGRES_PRISMA_URL",
      configured: Boolean(process.env.POSTGRES_PRISMA_URL),
      help: "Vercel Supabase連携が作成するPrisma向けPostgreSQL URLです。DATABASE_URL未設定時のfallbackにも使います。",
    },
    {
      key: "POSTGRES_URL",
      label: "POSTGRES_URL",
      configured: Boolean(process.env.POSTGRES_URL),
      help: "Vercel Supabase連携が作成するPostgreSQL URLです。DATABASE_URLとPOSTGRES_PRISMA_URL未設定時のfallbackです。",
    },
    {
      key: "POSTGRES_URL_NON_POOLING",
      label: "POSTGRES_URL_NON_POOLING",
      configured: Boolean(process.env.POSTGRES_URL_NON_POOLING),
      help: "migrationや管理用途向けの非pooling接続URLです。通常はDATABASE_URLへPOSTGRES_PRISMA_URLを設定します。",
    },
    {
      key: "EFFECTIVE_DATABASE_URL",
      label: "有効なDB URL",
      configured: Boolean(databaseUrl.url),
      help: `現在Prismaが参照する接続元: ${databaseUrlSourceLabel(databaseUrl.source)}。秘密値は表示しません。`,
    },
    {
      key: "AUTH_SECRET",
      label: "AUTH_SECRET",
      configured: Boolean(process.env.AUTH_SECRET),
      help: "認証用の署名・暗号化に使う十分に長いランダム文字列です。VercelのProduction/Preview/Developmentで必要な環境に設定し、変更後は再デプロイします。",
    },
    {
      key: "NEXTAUTH_URL",
      label: "NEXTAUTH_URL",
      configured: Boolean(process.env.NEXTAUTH_URL),
      help: "本番URLを設定します。例: https://score-base.vercel.app",
    },
    {
      key: "AUTH_URL",
      label: "AUTH_URL",
      configured: Boolean(process.env.AUTH_URL),
      help: "Auth.js / NextAuthで必要な場合に本番URLを設定します。",
    },
    {
      key: "AUTH_TRUST_HOST",
      label: "AUTH_TRUST_HOST",
      configured: Boolean(process.env.AUTH_TRUST_HOST),
      help: "Vercel環境でAuth.jsを使う場合に必要になることがあります。",
    },
    {
      key: "SUPABASE_URL",
      label: "SUPABASE_URL",
      configured: Boolean(process.env.SUPABASE_URL),
      help: "Vercel Supabase連携が作成するSupabase Project URLです。Prisma接続には通常使いません。",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      label: "NEXT_PUBLIC_SUPABASE_URL",
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      help: "クライアント側でSupabase SDKを使う場合の公開URLです。現在のPrisma接続には通常使いません。",
    },
  ];
}

export function publicBaseUrl() {
  return getPublicAppUrl();
}
