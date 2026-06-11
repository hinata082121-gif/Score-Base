import { TeamDetailClient } from "./TeamDetailClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getTeamForUser } from "@/lib/repositories/teams";

type TeamRow = {
  id?: string;
  name?: string | null;
  shortName?: string | null;
  category?: string | null;
  homeGround?: string | null;
  primaryColor?: string | null;
  memo?: string | null;
  players?: Array<{
    id?: string;
    name?: string | null;
    kana?: string | null;
    number?: string | null;
    primaryPosition?: string | null;
    primaryPos?: string | null;
    teamId?: string | null;
  }>;
  homeGames?: unknown[];
  awayGames?: unknown[];
  teamGames?: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
};

type TeamCategory = "" | "professional" | "college" | "high_school" | "amateur" | "youth" | "other";

function category(value?: string | null): TeamCategory {
  return value === "professional" || value === "college" || value === "high_school" || value === "amateur" || value === "youth" || value === "other" ? value : "";
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const team = user ? await getTeamForUser(id, user.id).catch(() => null) as TeamRow | null : null;
  return <TeamDetailClient id={id} initialTeam={team ? {
    id: String(team.id ?? ""),
    name: team.name ?? "",
    shortName: team.shortName ?? "",
    category: category(team.category),
    homeGround: team.homeGround ?? "",
    primaryColor: team.primaryColor ?? "#166534",
    memo: team.memo ?? "",
    createdAt: team.createdAt?.toISOString?.() ?? "",
    updatedAt: team.updatedAt?.toISOString?.() ?? "",
    storage: "DB",
    gameCount: (team.homeGames?.length ?? 0) + (team.awayGames?.length ?? 0) + (team.teamGames?.length ?? 0),
    players: (team.players ?? []).map((player) => ({
      id: String(player.id ?? ""),
      teamId: player.teamId ?? id,
      teamName: team.name ?? "",
      name: player.name ?? "",
      kana: player.kana ?? "",
      number: player.number ?? "",
      primaryPosition: player.primaryPosition ?? player.primaryPos ?? "",
      throwingHand: "UNKNOWN" as const,
      battingSide: "UNKNOWN" as const,
      memo: "",
      createdAt: "",
      updatedAt: "",
    })).filter((player) => player.id),
  } : null} />;
}
