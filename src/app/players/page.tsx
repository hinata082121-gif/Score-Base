import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listPlayersForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";
import { canManagePlayers } from "@/lib/auth/permissions";
import { PlayersClient } from "./PlayersClient";

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
  createdAt?: Date;
  updatedAt?: Date;
};
type TeamRow = { id?: string; name?: string | null };
type TeamWithMembers = TeamRow & { members?: Array<{ userId?: string | null; role?: string | null; status?: string | null }> };
type ThrowingHand = "RIGHT" | "LEFT" | "BOTH" | "UNKNOWN";
type BattingSide = "RIGHT" | "LEFT" | "SWITCH" | "UNKNOWN";

function throwingHand(value?: string | null): ThrowingHand {
  return value === "RIGHT" || value === "LEFT" || value === "BOTH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

function battingSide(value?: string | null): BattingSide {
  return value === "RIGHT" || value === "LEFT" || value === "SWITCH" || value === "UNKNOWN" ? value : "UNKNOWN";
}

export default async function PlayersPage() {
  const user = await getCurrentUserOrNull();
  const dbPlayers = user ? await listPlayersForUser(user.id) as PlayerRow[] : [];
  const dbTeams = user ? await listTeamsForUser(user.id) as TeamWithMembers[] : [];
  const editableTeamIds = new Set(dbTeams.filter((team) => team.members?.some((member) => member.userId === user?.id && member.status === "ACTIVE" && canManagePlayers(member.role ?? undefined))).map((team) => String(team.id ?? "")));
  return <PlayersClient dbPlayers={dbPlayers.map((player) => ({
    id: String(player.id ?? ""),
    teamId: player.teamId ?? "",
    teamName: player.team?.name ?? "",
    canEdit: Boolean(player.ownerId && player.ownerId === user?.id) || Boolean(player.teamId && editableTeamIds.has(player.teamId)),
    name: player.name ?? "",
    kana: player.kana ?? "",
    number: player.number ?? "",
    throwingHand: throwingHand(player.throwingHand ?? player.throws),
    battingSide: battingSide(player.battingSide ?? player.bats),
    primaryPosition: player.primaryPosition ?? player.primaryPos ?? "",
    memo: player.memo ?? "",
    createdAt: player.createdAt?.toISOString?.() ?? "",
    updatedAt: player.updatedAt?.toISOString?.() ?? "",
  })).filter((player) => player.id)} dbTeams={dbTeams.map((team) => ({ id: String(team.id ?? ""), name: team.name ?? "" })).filter((team) => team.id)} dbEnabled={Boolean(user)} />;
}
