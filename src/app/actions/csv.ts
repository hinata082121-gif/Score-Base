"use server";

import { parsePlayersCsv } from "@/lib/repositories/csv";

export async function exportCsvAction() {
  return { ok: false, error: "CSV出力は現在クライアント側ダウンロードで提供しています。" };
}

export async function importCsvAction(text: string) {
  const rows = parsePlayersCsv(text);
  const validRows = rows.filter((row) => row.valid);
  return { ok: true, total: rows.length, success: validRows.length, failed: rows.length - validRows.length, rows };
}
