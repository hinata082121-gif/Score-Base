import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { PlayersStatsClient } from "./PlayersStatsClient";

export default async function PlayersStatsPage() {
  const user = await getCurrentUserOrNull();
  const dbGames = user ? await listGamesForUser(user.id) : [];
  return <PlayersStatsClient dbGames={dbGames} dbEnabled={Boolean(user)} />;
}
