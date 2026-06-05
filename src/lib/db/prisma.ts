type PrismaClientLike = {
  game: Record<string, (...args: unknown[]) => Promise<unknown>>;
  team: Record<string, (...args: unknown[]) => Promise<unknown>>;
  player: Record<string, (...args: unknown[]) => Promise<unknown>>;
  plateAppearance: Record<string, (...args: unknown[]) => Promise<unknown>>;
  exportSnapshot: Record<string, (...args: unknown[]) => Promise<unknown>>;
  $transaction?: <T>(operations: Promise<T>[]) => Promise<T[]>;
};

const globalForPrisma = globalThis as typeof globalThis & {
  scoreBasePrisma?: PrismaClientLike;
};

export async function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL が未設定です。Vercelまたは.envにDATABASE_URLを設定してください。");
  }

  if (!globalForPrisma.scoreBasePrisma) {
    const clientModule = await import("@prisma/client");
    const PrismaClient = (clientModule as unknown as { PrismaClient?: new () => PrismaClientLike }).PrismaClient;
    if (!PrismaClient) {
      throw new Error("Prisma Clientが生成されていません。npx prisma generate を実行してください。");
    }
    globalForPrisma.scoreBasePrisma = new PrismaClient();
  }

  return globalForPrisma.scoreBasePrisma;
}

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function dbErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "DB処理で不明なエラーが発生しました。";
}
