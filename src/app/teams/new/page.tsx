import { getCurrentUserOrNull } from "@/lib/auth/serverAuth";
import { TeamFormClient } from "../TeamFormClient";

export default async function NewTeamPage() {
  const user = await getCurrentUserOrNull();
  return <TeamFormClient dbEnabled={Boolean(user)} />;
}
