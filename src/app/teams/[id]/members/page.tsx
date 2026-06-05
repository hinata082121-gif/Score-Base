import { TeamMembersClient } from "./TeamMembersClient";

export default async function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamMembersClient id={id} />;
}

