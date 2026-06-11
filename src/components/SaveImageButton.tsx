"use client";

import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { deploymentErrorGuidance } from "@/lib/errorGuidance";

export function SaveImageButton({ targetId, filename, onSaved }: { targetId: string; filename: string; onSaved?: () => void | Promise<void> }) {
  async function save() {
    const node = document.getElementById(targetId);
    if (!node) {
      window.alert("画像保存対象が見つかりません。出力カードが表示されているか確認してください。");
      return;
    }
    try {
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
      await onSaved?.();
    } catch {
      window.alert(`画像保存に失敗しました。${deploymentErrorGuidance("画像 PNG")}`);
    }
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
