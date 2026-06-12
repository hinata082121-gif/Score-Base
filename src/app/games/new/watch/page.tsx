import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { listGamesForUser } from "@/lib/repositories/games";
import { listTeamsForUser } from "@/lib/repositories/teams";

export default async function WatchGamePage() {
  const user = await getCurrentUserOrNull();
  const teams = user ? await listTeamsForUser(user.id).catch(() => []) as Array<{ id: string; name?: string | null; shortName?: string | null; homeGround?: string | null }> : [];
  const games = user ? await listGamesForUser(user.id).catch(() => []) : [];
  return (
    <PageShell title="観戦記録のみ" lead="感想、球場、応援チーム、MVPなどの観戦ログを記録します。">
      <GameForm mode="WATCH_ONLY" dbEnabled={Boolean(user)} dbTeams={teams.map((team) => ({ id: team.id, label: team.name ?? "", helper: team.shortName ?? team.homeGround ?? "", homeGround: team.homeGround ?? "" }))} dbGames={games} />
    </PageShell>
  );
}
