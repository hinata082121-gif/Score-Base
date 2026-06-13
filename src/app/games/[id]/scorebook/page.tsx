import { ScorebookClient } from "./ScorebookClient";
import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { getScorebookForGame } from "@/lib/repositories/games";

export default async function ScorebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserOrNull().catch(() => null);
  const dbGame = user ? await getScorebookForGame(id, user.id).catch(() => null) : null;
  return <ScorebookClient id={id} initialGame={dbGame} dbEnabled={Boolean(dbGame)} />;
}
