import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getPlayerForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";
import { PlayerFormClient } from "../../PlayerFormClient";

type PlayerRow = {
  teamId?: string | null;
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
};
type TeamRow = { id?: string; name?: string | null };
type ThrowingHand = "RIGHT" | "LEFT" | "BOTH" | "UNKNOWN";
type BattingSide = "RIGHT" | "LEFT" | "SWITCH" | "UNKNOWN";

function throwingHand(value?: string | null): ThrowingHand {
  return value === "RIGHT" || value === "LEFT" || value === "BOTH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

function battingSide(value?: string | null): BattingSide {
  return value === "RIGHT" || value === "LEFT" || value === "SWITCH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const player = user ? await getPlayerForUser(id, user.id).catch(() => null) as PlayerRow | null : null;
  const teams = user ? await listTeamsForUser(user.id) as TeamRow[] : [];
  return <PlayerFormClient id={id} dbEnabled={Boolean(player)} dbTeams={teams.map((team) => ({ id: String(team.id ?? ""), name: team.name ?? "" })).filter((team) => team.id)} initialPlayer={player ? { teamId: player.teamId ?? "", name: player.name ?? "", kana: player.kana ?? "", number: player.number ?? "", throwingHand: throwingHand(player.throwingHand ?? player.throws), battingSide: battingSide(player.battingSide ?? player.bats), primaryPosition: player.primaryPosition ?? player.primaryPos ?? "", memo: player.memo ?? "" } : undefined} />;
}
