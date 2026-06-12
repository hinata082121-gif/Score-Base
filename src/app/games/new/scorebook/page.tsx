import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { listPlayersForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";

export default async function ScorebookGamePage() {
  const user = await getCurrentUserOrNull();
  const teams = user ? await listTeamsForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }> : [];
  const players = user ? await listPlayersForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; teamId?: string | null; number?: string | null; primaryPosition?: string | null; primaryPos?: string | null }> : [];
  const games = user ? await listGamesForUser(user.id).catch(() => []) : [];
  return (
    <PageShell title="詳細スコアブック記録" lead="SBO、打席結果、打球方向、走者状況をボタン入力で構造化して保存します。">
      <GameForm mode="SCOREBOOK" dbEnabled={Boolean(user)} dbTeams={teams.map((team) => ({ id: team.id, label: team.name ?? "", helper: team.shortName ?? team.homeGround ?? "", homeGround: team.homeGround ?? "" }))} dbPlayers={players.map((player) => ({ id: player.id, label: player.name ?? "", teamId: player.teamId ?? "", number: player.number ?? "", position: player.primaryPosition ?? player.primaryPos ?? "" }))} dbGames={games} />
    </PageShell>
  );
}
