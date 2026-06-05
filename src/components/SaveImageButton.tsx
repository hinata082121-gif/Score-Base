"use client";

import { toPng } from "html-to-image";
import { Download } from "lucide-react";

export function SaveImageButton({ targetId, filename }: { targetId: string; filename: string }) {
  async function save() {
    const node = document.getElementById(targetId);
    if (!node) return;
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      style: { margin: "0" },
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  return (
    <button
      type="button"
      onClick={save}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
      title="対象カードをPNG画像として保存"
    >
      <Download className="h-4 w-4" />
      画像として保存
    </button>
  );
}
