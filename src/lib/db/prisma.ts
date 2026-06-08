import { deploymentErrorGuidance } from "@/lib/errorGuidance";

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
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL が未設定です。Vercelまたは.envにDATABASE_URLを設定してください。");
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
  if (databaseUrl.startsWith("file:")) {
    const adapterModule = await import("@prisma/adapter-better-sqlite3");
    const PrismaBetterSqlite3 = (adapterModule as unknown as { PrismaBetterSqlite3: new (options: { url: string }) => unknown }).PrismaBetterSqlite3;
    return new PrismaBetterSqlite3({ url: databaseUrl });
  }
  const adapterModule = await import("@prisma/adapter-pg");
  const PrismaPg = (adapterModule as unknown as { PrismaPg: new (options: { connectionString: string }) => unknown }).PrismaPg;
  return new PrismaPg({ connectionString: databaseUrl });
}

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function dbErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "DB処理で不明なエラーが発生しました。";
  return `${message} ${deploymentErrorGuidance(message)}`;
}
