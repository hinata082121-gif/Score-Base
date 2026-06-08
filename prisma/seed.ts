import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const samplePassword = "scorebase-demo";

type SeedDelegate = {
  upsert: (args: unknown) => Promise<Record<string, string>>;
};

type SeedPrisma = {
  user: SeedDelegate;
  team: SeedDelegate;
  teamMember: SeedDelegate;
  player: SeedDelegate;
  game: SeedDelegate;
  $disconnect: () => Promise<void>;
};

type PrismaClientOptions = {
  adapter: unknown;
};

function hashPassword(password: string) {
  return createHash("sha256").update(`score-base:${password}`).digest("hex");
}

function loadLocalEnv() {
  if (process.env.DATABASE_URL || !existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, "");
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("This seed is for local development only. Do not run it in production.");
  }

  loadLocalEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for seed.");

  const generatedClientPath = "../src/generated/prisma/client";
  const clientModule = await import(generatedClientPath);
  const PrismaClient = (clientModule as unknown as { PrismaClient?: new (options: PrismaClientOptions) => SeedPrisma }).PrismaClient;
  if (!PrismaClient) throw new Error("Prisma Client is not generated. Run npm run prisma:generate first.");
  const prisma = new PrismaClient({ adapter: await createPrismaAdapter(databaseUrl) });

  const users = await Promise.all(
    [
      ["seed-owner@example.com", "Owner User", "OWNER"],
      ["seed-admin@example.com", "Admin User", "ADMIN"],
      ["seed-editor@example.com", "Editor User", "EDITOR"],
      ["seed-scorer@example.com", "Scorer User", "SCORER"],
      ["seed-viewer@example.com", "Viewer User", "VIEWER"],
    ].map(([email, name]) =>
      prisma.user.upsert({
        where: { email },
        update: { name, displayName: name, passwordHash: hashPassword(samplePassword) },
        create: { email, name, displayName: name, passwordHash: hashPassword(samplePassword) },
      }),
    ),
  );

  const team = await prisma.team.upsert({
    where: { id: "seed-team-score-base" },
    update: { name: "Score Base Seeds", shortName: "SBS", category: "amateur", visibility: "PRIVATE", ownerId: users[0].id },
    create: { id: "seed-team-score-base", name: "Score Base Seeds", shortName: "SBS", category: "amateur", visibility: "PRIVATE", ownerId: users[0].id },
  });

  const roles = ["OWNER", "ADMIN", "EDITOR", "SCORER", "VIEWER"];
  await Promise.all(
    users.map((user, index) =>
      prisma.teamMember.upsert({
        where: { teamId_userId: { teamId: team.id, userId: user.id } },
        update: { role: roles[index], status: "ACTIVE" },
        create: { teamId: team.id, userId: user.id, role: roles[index], status: "ACTIVE" },
      }),
    ),
  );

  await prisma.player.upsert({
    where: { id: "seed-player-owner" },
    update: { name: "Seed Player", teamId: team.id, ownerId: users[0].id, number: "1", primaryPosition: "P" },
    create: { id: "seed-player-owner", name: "Seed Player", teamId: team.id, ownerId: users[0].id, number: "1", primaryPosition: "P" },
  });

  await prisma.game.upsert({
    where: { id: "seed-game-score-base" },
    update: {
      teamId: team.id,
      ownerId: users[0].id,
      createdById: users[0].id,
      updatedById: users[0].id,
      homeTeamName: team.name,
      awayTeamName: "Visitors",
      homeScore: 3,
      awayScore: 2,
    },
    create: {
      id: "seed-game-score-base",
      mode: "SCOREBOOK",
      gameDate: new Date("2026-01-01T09:00:00.000Z"),
      teamId: team.id,
      ownerId: users[0].id,
      createdById: users[0].id,
      updatedById: users[0].id,
      homeTeamName: team.name,
      awayTeamName: "Visitors",
      homeScore: 3,
      awayScore: 2,
      status: "NORMAL",
      visibility: "PRIVATE",
    },
  });

  console.log(`Seed complete. Sample password for all users: ${samplePassword}`);
  await prisma.$disconnect();
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

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
