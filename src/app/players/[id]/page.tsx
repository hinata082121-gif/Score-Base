import { PlayerDetailClient } from "./PlayerDetailClient";
import { canManagePlayers } from "@/lib/auth/permissions";
import { getCurrentUserOrNull, getMembership } from "@/lib/auth/serverAuth";
import { getPlayerForUser } from "@/lib/repositories/players";

type ThrowingHand = "RIGHT" | "LEFT" | "BOTH" | "UNKNOWN";
type BattingSide = "RIGHT" | "LEFT" | "SWITCH" | "UNKNOWN";
type PlayerRow = {
  id?: string;
  ownerId?: string | null;
  teamId?: string | null;
  team?: { name?: string | null } | null;
  name?: string | null;
  kana?: string | null;
  number?: string | null;
  throwingHand?: string | null;
  throws?: string | null;
  battingSide?: string | null;
  bats?: string | null;
  primaryPosition?: string | null;
  primaryPos?: string | null;
  memo?: string | null;
  visibility?: string | null;
  battingRecords?: Array<{ result?: string | null; rbi?: number | null; gameId?: string | null }>;
  pitchingRecords?: Array<{ result?: string | null; gameId?: string | null }>;
  lineupEntries?: Array<{ gameId?: string | null }>;
  createdAt?: Date;
  updatedAt?: Date;
};

function throwingHand(value?: string | null): ThrowingHand {
  return value === "RIGHT" || value === "LEFT" || value === "BOTH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

function battingSide(value?: string | null): BattingSide {
  return value === "RIGHT" || value === "LEFT" || value === "SWITCH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

function isHit(result?: string | null) {
  if (!result) return false;
  return ["HIT", "SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN", "HR", "安打", "単打", "二塁打", "三塁打", "本塁打"].includes(result);
}

export default async function PlayerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ returnTo?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getCurrentUserOrNull();
  const player = user ? await getPlayerForUser(id, user.id).catch(() => null) as PlayerRow | null : null;
  let teamRole: string | undefined;
  if (user && player?.teamId) {
    teamRole = (await getMembership(player.teamId, user.id))?.role;
  }
  const canEdit = Boolean(player?.ownerId && player.ownerId === user?.id) || canManagePlayers(teamRole);
  return (
    <PlayerDetailClient
      id={id}
      returnTo={query?.returnTo ?? ""}
      initialDbPlayer={player ? {
        id: String(player.id ?? ""),
        teamId: player.teamId ?? "",
        teamName: player.team?.name ?? "",
        name: player.name ?? "",
        kana: player.kana ?? "",
        number: player.number ?? "",
        throwingHand: throwingHand(player.throwingHand ?? player.throws),
        battingSide: battingSide(player.battingSide ?? player.bats),
        primaryPosition: player.primaryPosition ?? player.primaryPos ?? "",
        memo: player.memo ?? "",
        createdAt: player.createdAt?.toISOString?.() ?? "",
        updatedAt: player.updatedAt?.toISOString?.() ?? "",
        storage: "DB",
        visibility: player.visibility ?? "PRIVATE",
        canEdit,
        canDelete: canEdit,
        roleLabel: player.ownerId === user?.id ? "所有者" : teamRole ?? "閲覧可能",
        statsSummary: {
          plateAppearances: player.battingRecords?.length ?? 0,
          hits: player.battingRecords?.filter((record) => isHit(record.result)).length ?? 0,
          rbi: player.battingRecords?.reduce((sum, record) => sum + (record.rbi ?? 0), 0) ?? 0,
          pitchingAppearances: player.pitchingRecords?.length ?? 0,
          games: new Set([...(player.lineupEntries ?? []), ...(player.battingRecords ?? []), ...(player.pitchingRecords ?? [])].map((record) => record.gameId).filter(Boolean)).size,
        },
        recentAppearances: player.battingRecords?.slice(-10).reverse().map((record) => ({ game: record.gameId ? `Game ${record.gameId}` : "DB記録", result: record.result ?? "-" })) ?? [],
      } : null}
    />
  );
}
