import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listTeamsForUser } from "@/lib/repositories/teams";
import { PlayerFormClient } from "../PlayerFormClient";

type TeamRow = { id?: string; name?: string | null };

export default async function NewPlayerPage() {
  const user = await getCurrentUserOrNull();
  const teams = user ? await listTeamsForUser(user.id) as TeamRow[] : [];
  return <PlayerFormClient dbEnabled={Boolean(user)} dbTeams={teams.map((team) => ({ id: String(team.id ?? ""), name: team.name ?? "" })).filter((team) => team.id)} />;
}
