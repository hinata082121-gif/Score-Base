"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { parsePlayersCsv } from "@/lib/repositories/csv";
import { loadTeams, upsertPlayer } from "@/lib/masterStorage";

type PreviewRow = ReturnType<typeof parsePlayersCsv>[number];

export function ImportPlayersClient() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [message, setMessage] = useState("CSVを選択してください。");

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parsePlayersCsv(text);
    setRows(parsed);
    setMessage(`${parsed.length}行を読み込みました。選手名がない行はエラーになります。`);
  }

  function importRows() {
    const teams = loadTeams();
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      if (!row.valid) {
        failed += 1;
        continue;
      }
      const teamName = row.record["チーム名"] || row.record["teamName"] || "";
      const team = teams.find((item) => item.name === teamName || item.shortName === teamName);
      upsertPlayer({
        teamId: team?.id ?? "",
        teamName: team?.name ?? String(teamName),
        name: String(row.record["選手名"] || row.record["name"]),
        kana: String(row.record["ふりがな"] || row.record["kana"] || ""),
        number: String(row.record["背番号"] || row.record["number"] || ""),
        throwingHand: "UNKNOWN",
        battingSide: "UNKNOWN",
        primaryPosition: String(row.record["主守備位置"] || row.record["primaryPosition"] || ""),
        memo: String(row.record["メモ"] || row.record["memo"] || ""),
      });
      success += 1;
    }
    setMessage(`インポート完了: 成功 ${success}件 / 失敗 ${failed}件`);
  }

  return (
    <PageShell title="選手CSVインポート" lead="先頭行をヘッダーとして認識し、選手名のある行を登録します。">
      <div className="space-y-4">
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <input type="file" accept=".csv,text/csv" onChange={onFileChange} className="min-h-11 w-full rounded-md border border-stone-300 p-2" />
          <p className="mt-3 rounded-md bg-stone-50 p-3 text-sm font-bold text-stone-700">{message}</p>
          <button type="button" disabled={rows.length === 0} onClick={importRows} className="mt-3 min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white disabled:bg-stone-300">インポート実行</button>
        </section>
        <section className="overflow-x-auto rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">プレビュー</h2>
          {rows.length === 0 ? <p className="mt-3 text-sm font-bold text-stone-500">CSVインポート対象がありません。</p> : (
            <table className="mt-3 w-max min-w-full text-sm">
              <thead><tr className="bg-stone-100"><th className="p-2">行</th><th className="p-2">状態</th><th className="p-2 text-left">選手名</th><th className="p-2 text-left">チーム名</th><th className="p-2 text-left">エラー</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.rowNumber} className="border-t border-stone-100"><td className="p-2 text-center">{row.rowNumber}</td><td className="p-2 text-center">{row.valid ? "OK" : "NG"}</td><td className="p-2">{String(row.record["選手名"] || row.record["name"] || "")}</td><td className="p-2">{String(row.record["チーム名"] || row.record["teamName"] || "")}</td><td className="p-2 text-red-700">{row.error}</td></tr>)}</tbody>
            </table>
          )}
        </section>
      </div>
    </PageShell>
  );
}
