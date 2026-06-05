import { PlayerFormClient } from "../../PlayerFormClient";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerFormClient id={id} />;
}
