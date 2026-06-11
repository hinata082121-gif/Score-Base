export type DatabaseUrlSource =
  | "DATABASE_URL"
  | "POSTGRES_PRISMA_URL"
  | "POSTGRES_URL"
  | "POSTGRES_URL_NON_POOLING"
  | "not_configured";

export type ResolvedDatabaseUrl = {
  url: string;
  source: DatabaseUrlSource;
};

type DatabaseUrlEnvKey = Exclude<DatabaseUrlSource, "not_configured">;

const databaseUrlEnvKeys: DatabaseUrlEnvKey[] = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
];

export function resolveDatabaseUrl(): ResolvedDatabaseUrl {
  for (const key of databaseUrlEnvKeys) {
    const url = process.env[key];
    if (url) return { url, source: key };
  }
  return { url: "", source: "not_configured" };
}

export function isPostgresDatabaseUrl(url: string) {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export function databaseUrlSourceLabel(source: DatabaseUrlSource) {
  if (source === "not_configured") return "未設定";
  if (source === "DATABASE_URL") return "DATABASE_URL";
  return `${source} fallback`;
}
