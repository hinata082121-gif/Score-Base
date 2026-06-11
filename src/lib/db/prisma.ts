import { deploymentErrorGuidance } from "@/lib/errorGuidance";
import { isPostgresDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/databaseUrl";

type PrismaClientLike = {
  game: Record<string, (...args: unknown[]) => Promise<unknown>>;
  team: Record<string, (...args: unknown[]) => Promise<unknown>>;
  player: Record<string, (...args: unknown[]) => Promise<unknown>>;
  plateAppearance: Record<string, (...args: unknown[]) => Promise<unknown>>;
  exportSnapshot: Record<string, (...args: unknown[]) => Promise<unknown>>;
  $transaction?: <T>(operations: Promise<T>[]) => Promise<T[]>;
};

type PrismaClientOptions = {
  adapter: unknown;
};

const globalForPrisma = globalThis as typeof globalThis & {
  scoreBasePrisma?: PrismaClientLike;
};

export async function getPrisma() {
  const { url: databaseUrl } = resolveDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL が未設定です。Vercel Supabase連携でPOSTGRES_PRISMA_URLが作成されている場合は、その値をDATABASE_URLへコピーしてください。");
  }

  if (!globalForPrisma.scoreBasePrisma) {
    const clientModule = await import("@/generated/prisma/client");
    const PrismaClient = (clientModule as unknown as { PrismaClient?: new (options: PrismaClientOptions) => PrismaClientLike }).PrismaClient;
    if (!PrismaClient) {
      throw new Error("Prisma Clientが生成されていません。npm run prisma:generate を実行してください。");
    }
    globalForPrisma.scoreBasePrisma = new PrismaClient({ adapter: await createPrismaAdapter(databaseUrl) });
  }

  return globalForPrisma.scoreBasePrisma;
}

async function createPrismaAdapter(databaseUrl: string) {
  if (!isPostgresDatabaseUrl(databaseUrl)) {
    throw new Error("DATABASE_URL はPostgreSQL接続URLを設定してください。Vercel Supabase連携ではPOSTGRES_PRISMA_URLの値をDATABASE_URLへコピーすることを推奨します。");
  }
  const adapterModule = await import("@prisma/adapter-pg");
  const PrismaPg = (adapterModule as unknown as { PrismaPg: new (options: { connectionString: string }) => unknown }).PrismaPg;
  return new PrismaPg({ connectionString: databaseUrl });
}

export function isDbConfigured() {
  return Boolean(resolveDatabaseUrl().url);
}

export function dbErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "DB処理で不明なエラーが発生しました。";
  return `${message} ${deploymentErrorGuidance(message)}`;
}
