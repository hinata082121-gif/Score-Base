import { ScorebookClient } from "./ScorebookClient";

export default async function ScorebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScorebookClient id={id} />;
}
