import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listTeamsForUser } from "@/lib/repositories/teams";
import { TeamsClient } from "./TeamsClient";

type TeamRow = {
  id?: string;
  name?: string | null;
  shortName?: string | null;
  category?: string | null;
  homeGround?: string | null;
  primaryColor?: string | null;
  memo?: string | null;
  players?: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
};
type TeamCategory = "" | "professional" | "college" | "high_school" | "amateur" | "youth" | "other";

function category(value?: string | null): TeamCategory {
  return value === "professional" || value === "college" || value === "high_school" || value === "amateur" || value === "youth" || value === "other" ? value : "";
}

export default async function TeamsPage() {
  const user = await getCurrentUserOrNull();
  const dbTeams = user ? await listTeamsForUser(user.id) as TeamRow[] : [];
  return <TeamsClient dbTeams={dbTeams.map((team) => ({
    id: String(team.id ?? ""),
    name: team.name ?? "",
    shortName: team.shortName ?? "",
    category: category(team.category),
    homeGround: team.homeGround ?? "",
    primaryColor: team.primaryColor ?? "#166534",
    memo: team.memo ?? "",
    players: team.players ?? [],
    createdAt: team.createdAt?.toISOString?.() ?? "",
    updatedAt: team.updatedAt?.toISOString?.() ?? "",
  })).filter((team) => team.id)} dbEnabled={Boolean(user)} />;
}
