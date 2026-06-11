import { getPublicAppUrl } from "@/lib/url";

export type DeploymentCheck = {
  key: string;
  label: string;
  configured: boolean;
  help: string;
};

export function deploymentEnvChecks(): DeploymentCheck[] {
  return [
    {
      key: "DATABASE_URL",
      label: "DATABASE_URL",
      configured: Boolean(process.env.DATABASE_URL),
      help: "Prismaが接続するDB URLです。本番ではPostgreSQLを推奨します。",
    },
    {
      key: "AUTH_SECRET",
      label: "AUTH_SECRET",
      configured: Boolean(process.env.AUTH_SECRET),
      help: "認証用の署名・暗号化に使う十分に長いランダム文字列です。",
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
  ];
}

export function publicBaseUrl() {
  return getPublicAppUrl();
}
