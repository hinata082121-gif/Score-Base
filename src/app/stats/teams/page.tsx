import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { TeamsStatsClient } from "./TeamsStatsClient";

export default async function TeamsStatsPage() {
  const user = await getCurrentUserOrNull();
  const dbGames = user ? await listGamesForUser(user.id) : [];
  return <TeamsStatsClient dbGames={dbGames} dbEnabled={Boolean(user)} />;
}
