"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ScorebookTable } from "@/components/ScorebookTable";
import { loadGame, loadSettings } from "@/lib/storage";
import type { ScoreBaseGame, ScorebookStyle } from "@/lib/types";

export function ScorebookClient({ id }: { id: string }) {
  const [game, setGame] = useState<ScoreBaseGame | null>(null);
  const [style, setStyle] = useState<ScorebookStyle>("WASEDA");

  useEffect(() => {
    setGame(loadGame(id) ?? null);
    setStyle(loadSettings().defaultStyle);
  }, [id]);

  if (!game) return <PageShell title="スコアブック"><div className="rounded-md bg-white p-6">記録が見つかりません。</div></PageShell>;

  return (
    <PageShell title="スコアブック表示" lead="内部データは共通のまま、表示テンプレートだけを切り替えます。">
      <div className="space-y-4">
        <div className="rounded-md border border-stone-200 bg-white p-3 shadow-sm">
          <div className="inline-flex rounded-md border border-stone-300 bg-white p-1">
            <button type="button" onClick={() => setStyle("WASEDA")} className={`rounded px-4 py-2 text-sm font-bold ${style === "WASEDA" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>早稲田式</button>
            <button type="button" onClick={() => setStyle("KEIO")} className={`rounded px-4 py-2 text-sm font-bold ${style === "KEIO" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>慶應式</button>
          </div>
          <p className="mt-2 text-sm font-bold text-stone-600">
            {style === "WASEDA" ? "補助線を多めに入れ、一般的なスコアブックらしいセル表示にします。" : "補助線を抑え、公式記録風の読みやすいセル表示にします。"}
          </p>
        </div>
        <ScorebookTable game={game} style={style} />
      </div>
    </PageShell>
  );
}
