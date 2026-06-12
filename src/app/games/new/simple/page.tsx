import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { listPlayersForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";

export default async function SimpleGamePage() {
  const user = await getCurrentUserOrNull();
  const teams = user ? await listTeamsForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }> : [];
  const players = user ? await listPlayersForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; teamId?: string | null; number?: string | null; primaryPosition?: string | null; primaryPos?: string | null }> : [];
  const games = user ? await listGamesForUser(user.id).catch(() => []) : [];
  return (
    <PageShell title="簡易記録" lead="観戦メモに加えて、スタメン、イニングスコア、投手・本塁打メモを残します。">
      <GameForm mode="SIMPLE" dbEnabled={Boolean(user)} dbTeams={teams.map((team) => ({ id: team.id, label: team.name ?? "", helper: team.shortName ?? team.homeGround ?? "", homeGround: team.homeGround ?? "" }))} dbPlayers={players.map((player) => ({ id: player.id, label: player.name ?? "", teamId: player.teamId ?? "", number: player.number ?? "", position: player.primaryPosition ?? player.primaryPos ?? "" }))} dbGames={games} />
    </PageShell>
  );
}
