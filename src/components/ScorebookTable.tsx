"use client";

import { SaveImageButton } from "./SaveImageButton";
import type { ScoreBaseGame, ScorebookStyle } from "@/lib/types";

function cellClass(style: ScorebookStyle) {
  return style === "WASEDA"
    ? "bg-[linear-gradient(135deg,transparent_48%,#166534_49%,#166534_51%,transparent_52%)]"
    : "bg-[linear-gradient(90deg,transparent_49%,#a16207_50%,transparent_51%),linear-gradient(0deg,transparent_49%,#a16207_50%,transparent_51%)]";
}

export function ScorebookTable({ game, style }: { game: ScoreBaseGame; style: ScorebookStyle }) {
  const innings = Array.from(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, ...game.plateAppearances.map((pa) => pa.inning)]));
  const orders = Array.from(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, ...game.plateAppearances.map((pa) => pa.battingOrder)])).sort((a, b) => a - b);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-stone-950">{style === "WASEDA" ? "早稲田式" : "慶應式"}スコアブック</h2>
          <p className="text-sm text-stone-600">{game.awayTeamName} vs {game.homeTeamName}</p>
        </div>
        <SaveImageButton targetId="scorebook-export" filename="score-base-scorebook.png" />
      </div>
      <div className="overflow-x-auto rounded-md border border-stone-300 bg-white shadow-sm">
        <div id="scorebook-export" className="w-max min-w-full bg-white p-4">
          <div className="mb-3 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-emerald-700">Score Base</p>
              <h3 className="text-xl font-black text-stone-950">{game.awayTeamName} vs {game.homeTeamName}</h3>
              <p className="text-sm text-stone-600">{game.gameDate} / {game.venue} / {game.competition}</p>
            </div>
            <p className="text-sm font-bold text-stone-700">{style === "WASEDA" ? "早稲田式テンプレート" : "慶應式テンプレート"}</p>
          </div>
          <table className="border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-28 border border-stone-400 bg-stone-100 p-2">打順</th>
                {innings.map((inning) => (
                  <th key={inning} className="w-28 border border-stone-400 bg-stone-100 p-2 text-center">{inning}回</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order}>
                  <th className="sticky left-0 z-10 border border-stone-400 bg-white p-2 text-stone-900">{order}番</th>
                  {innings.map((inning) => {
                    const pa = game.plateAppearances.find((item) => item.battingOrder === order && item.inning === inning);
                    return (
                      <td key={`${order}-${inning}`} className={`h-28 w-28 border border-stone-400 p-1 align-top ${cellClass(style)}`}>
                        {pa ? (
                          <div className="flex h-full flex-col justify-between rounded-sm bg-white/85 p-1">
                            <div>
                              <p className="font-black text-stone-950">{pa.batterName || `${order}番打者`}</p>
                              <p className="text-[13px] font-bold text-emerald-800">{pa.result}</p>
                            </div>
                            <div className="space-y-0.5 text-[10px] leading-4 text-stone-700">
                              <p>B{pa.balls} S{pa.strikes} O{pa.outsBefore}-{pa.outsAfter}</p>
                              <p>{pa.battedBallType || "-"} / {pa.hitDirection || "-"}</p>
                              <p>打点{pa.rbi} 得点{pa.runScored ? "1" : "0"}</p>
                              <p>{pa.baseStateAfter || "残塁なし"}</p>
                            </div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
