import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getTeamForUser } from "@/lib/repositories/teams";
import { TeamFormClient } from "../../TeamFormClient";

type TeamRow = {
  name?: string | null;
  shortName?: string | null;
  category?: string | null;
  homeGround?: string | null;
  primaryColor?: string | null;
  memo?: string | null;
};
type TeamCategory = "" | "professional" | "college" | "high_school" | "amateur" | "youth" | "other";

function category(value?: string | null): TeamCategory {
  return value === "professional" || value === "college" || value === "high_school" || value === "amateur" || value === "youth" || value === "other" ? value : "";
}

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const team = user ? await getTeamForUser(id, user.id).catch(() => null) as TeamRow | null : null;
  return <TeamFormClient id={id} dbEnabled={Boolean(team)} initialTeam={team ? { name: team.name ?? "", shortName: team.shortName ?? "", category: category(team.category), homeGround: team.homeGround ?? "", primaryColor: team.primaryColor ?? "#166534", memo: team.memo ?? "" } : undefined} />;
}
