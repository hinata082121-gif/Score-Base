"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ScorebookTable } from "@/components/ScorebookTable";
import { loadGame, loadSettings } from "@/lib/storage";
import type { BallLogGame, ScorebookStyle } from "@/lib/types";

export function ScorebookClient({ id }: { id: string }) {
  const [game, setGame] = useState<BallLogGame | null>(null);
  const [style, setStyle] = useState<ScorebookStyle>("WASEDA");

  useEffect(() => {
    setGame(loadGame(id) ?? null);
    setStyle(loadSettings().defaultStyle);
  }, [id]);

  if (!game) return <PageShell title="スコアブック"><div className="rounded-md bg-white p-6">記録が見つかりません。</div></PageShell>;

  return (
    <PageShell title="スコアブック表示" lead="内部データは共通のまま、表示テンプレートだけを切り替えます。">
      <div className="space-y-4">
        <div className="inline-flex rounded-md border border-stone-300 bg-white p-1">
          <button type="button" onClick={() => setStyle("WASEDA")} className={`rounded px-4 py-2 text-sm font-bold ${style === "WASEDA" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>早稲田式</button>
          <button type="button" onClick={() => setStyle("KEIO")} className={`rounded px-4 py-2 text-sm font-bold ${style === "KEIO" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>慶應式</button>
        </div>
        <ScorebookTable game={game} style={style} />
      </div>
    </PageShell>
  );
}
