import { TeamInvitationsClient } from "./TeamInvitationsClient";

export default async function TeamInvitationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamInvitationsClient id={id} />;
}

