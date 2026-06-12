"use client";

import { useEffect, useState } from "react";
import { GameForm } from "@/components/GameForm";
import { PageShell } from "@/components/PageShell";
import { ScorebookTable } from "@/components/ScorebookTable";
import { loadGame, loadSettings } from "@/lib/storage";
import type { ScoreBaseGame, ScorebookStyle } from "@/lib/types";

export function ScorebookClient({ id, initialGame, dbEnabled = false }: { id: string; initialGame?: ScoreBaseGame | null; dbEnabled?: boolean }) {
  const [game, setGame] = useState<ScoreBaseGame | null>(initialGame ?? null);
  const [style, setStyle] = useState<ScorebookStyle>("WASEDA");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!initialGame) setGame(loadGame(id) ?? null);
    setStyle(loadSettings().defaultStyle);
    setReady(true);
  }, [id, initialGame]);

  if (!ready) return <PageShell title="スコアブック"><div className="rounded-md bg-white p-6">読み込み中です。</div></PageShell>;
  if (!game) return <PageShell title="スコアブック"><div className="rounded-md bg-white p-6">記録が見つかりません。</div></PageShell>;
  if (game.mode === "SCOREBOOK") {
    return (
      <PageShell title="スコアブック入力" lead="試合詳細確認、スタメン確認、試合開始を経て、スマホ全画面に近い入力UIで記録します。">
        <GameForm mode="SCOREBOOK" editId={id} initialGame={game} dbEnabled={dbEnabled} />
      </PageShell>
    );
  }

  return (
    <PageShell title="スコアブック表示" lead="内部データは共通のまま、表示テンプレートだけを切り替えます。">
      <div className="space-y-4">
        <div className="rounded-md border border-stone-200 bg-white p-3 shadow-sm">
          <p className="mb-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">{dbEnabled ? "DB保存済みスコアブック" : "ローカル保存スコアブック"}</p>
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
