"use client";

import { Download } from "lucide-react";
import { deploymentErrorGuidance } from "@/lib/errorGuidance";

export function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8") {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    window.alert(`CSV出力に失敗しました。${deploymentErrorGuidance("CSV")}`);
  }
}

export function CsvDownloadButton({ filename, getCsv, label = "CSV保存" }: { filename: string; getCsv: () => string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => downloadText(filename, getCsv())}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
