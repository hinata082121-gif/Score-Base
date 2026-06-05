import { ExportClient } from "./ExportClient";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExportClient id={id} />;
}
