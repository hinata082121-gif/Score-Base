import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getGameByIdForUser, listGamesForUser } from "@/lib/repositories/games";
import { listPlayersForUser } from "@/lib/repositories/players";
import { listTeamsForUser } from "@/lib/repositories/teams";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull();
  const dbGame = user ? await getGameByIdForUser(id, user.id).catch(() => null) : null;
  const teams = user ? await listTeamsForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }> : [];
  const players = user ? await listPlayersForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; teamId?: string | null; number?: string | null; primaryPosition?: string | null; primaryPos?: string | null }> : [];
  const games = user ? await listGamesForUser(user.id).catch(() => []) : [];
  return (
    <PageShell title="観戦記録を編集" lead="保存済みの内容を読み込み、再保存します。">
      <GameForm mode={dbGame?.mode ?? "WATCH_ONLY"} editId={id} initialGame={dbGame} dbEnabled={Boolean(dbGame)} dbTeams={teams.map((team) => ({ id: team.id, label: team.name ?? "", helper: team.shortName ?? team.homeGround ?? "", homeGround: team.homeGround ?? "" }))} dbPlayers={players.map((player) => ({ id: player.id, label: player.name ?? "", teamId: player.teamId ?? "", number: player.number ?? "", position: player.primaryPosition ?? player.primaryPos ?? "" }))} dbGames={games} />
    </PageShell>
  );
}
