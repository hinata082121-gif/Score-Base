"use client";

import { Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deploymentErrorGuidance } from "@/lib/errorGuidance";

export function ShareButton({ text, url }: { text: string; url?: string }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  async function share() {
    const fullText = url ? `${text}\n${url}` : text;
    if (canShare) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // Fall back to clipboard below.
      }
    }
    try {
      await navigator.clipboard.writeText(fullText);
      window.alert("共有テキストをコピーしました。");
    } catch {
      window.alert(`共有テキストのコピーに失敗しました。${deploymentErrorGuidance("共有")}`);
    }
  }

  return (
    <button type="button" onClick={share} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white">
      {canShare ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      共有
    </button>
  );
}
