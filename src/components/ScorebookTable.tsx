"use client";

import { SaveImageButton } from "./SaveImageButton";
import { battedBallShortLabels, hitDirectionShortLabels, plateResultLabels, plateResultShortLabels } from "@/lib/constants";
import type { BattedBallType, HitDirection, PlateResult } from "@/lib/types";
import type { ScoreBaseGame, ScorebookStyle } from "@/lib/types";

function cellClass(style: ScorebookStyle) {
  return style === "WASEDA"
    ? "bg-[linear-gradient(135deg,transparent_48%,#166534_49%,#166534_51%,transparent_52%),linear-gradient(45deg,transparent_48%,#166534_49%,#166534_51%,transparent_52%)]"
    : "bg-[radial-gradient(circle_at_center,#fef3c7_0_18%,transparent_19%)]";
}

function safeFilename(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function resultLabel(result: string, short = false) {
  return short ? plateResultShortLabels[result as PlateResult] ?? result : plateResultLabels[result as PlateResult] ?? result;
}

function battedBallLabel(value?: string) {
  if (!value) return "-";
  return battedBallShortLabels[value as BattedBallType] ?? value;
}

function directionLabel(value?: string) {
  if (!value) return "-";
  return hitDirectionShortLabels[value as HitDirection] ?? value;
}

export function ScorebookTable({ game, style }: { game: ScoreBaseGame; style: ScorebookStyle }) {
  const innings = Array.from(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, ...game.plateAppearances.map((pa) => pa.inning)]));
  const orders = Array.from(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, ...game.plateAppearances.map((pa) => pa.battingOrder)])).sort((a, b) => a - b);
  const filename = `score-base-${safeFilename(game.gameDate)}-${safeFilename(game.awayTeamName || "away")}-vs-${safeFilename(game.homeTeamName || "home")}.png`;
  const teams = [
    { side: "TOP" as const, name: game.awayTeamName || "ビジター" },
    { side: "BOTTOM" as const, name: game.homeTeamName || "ホーム" },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-stone-950">{style === "WASEDA" ? "早稲田式" : "慶應式"}スコアブック</h2>
          <p className="text-sm text-stone-600">{style === "WASEDA" ? "補助線とベース配置を強調したスコアブック風表示" : "補助線を抑えた公式記録風のシンプル表示"}</p>
        </div>
        <SaveImageButton targetId="scorebook-export" filename={filename} />
      </div>
      <div className="overflow-x-auto rounded-md border border-stone-300 bg-white shadow-sm">
        <div id="scorebook-export" className="w-max min-w-full bg-white p-5 text-stone-950">
          <div className="mb-3 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-emerald-700">Score Base</p>
              <h3 className="text-xl font-black text-stone-950">{game.awayTeamName} vs {game.homeTeamName}</h3>
              <p className="text-sm text-stone-600">{game.gameDate} / {game.venue} / {game.competition}</p>
            </div>
            <p className="text-sm font-bold text-stone-700">{style === "WASEDA" ? "早稲田式テンプレート" : "慶應式テンプレート"}</p>
          </div>
          <div className="space-y-6">
            {teams.map((team) => (
              <section key={team.side}>
                <h4 className="mb-2 text-base font-black text-stone-950">{team.name} {team.side === "TOP" ? "攻撃" : "攻撃"}</h4>
                <table className="border-collapse text-left text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 w-32 border border-stone-400 bg-stone-100 p-2">打順</th>
                      {innings.map((inning) => (
                        <th key={inning} className="w-32 border border-stone-400 bg-stone-100 p-2 text-center">{inning}回</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={`${team.side}-${order}`}>
                        <th className="sticky left-0 z-10 border border-stone-400 bg-white p-2 text-stone-900">{order}番</th>
                        {innings.map((inning) => {
                          const plateAppearances = game.plateAppearances.filter((item) => item.topBottom === team.side && item.battingOrder === order && item.inning === inning);
                          return (
                            <td key={`${team.side}-${order}-${inning}`} className={`h-32 w-32 border border-stone-400 p-1 align-top ${cellClass(style)}`}>
                              <div className="flex h-full flex-col gap-1">
                                {plateAppearances.map((pa) => (
                                  <div key={pa.id} className={`flex flex-1 flex-col justify-between rounded-sm p-1 ${style === "WASEDA" ? "bg-white/90 ring-1 ring-emerald-100" : "bg-white/95"}`}>
                                    <div className="flex items-start justify-between gap-1">
                                      <p className="max-w-16 truncate font-black text-stone-950">{pa.batterName || `${order}番`}</p>
                                      <p className="rounded bg-emerald-700 px-1.5 py-0.5 text-[11px] font-black text-white">{resultLabel(pa.result, true)}</p>
                                    </div>
                                    <div className="space-y-0.5 text-[10px] leading-4 text-stone-700">
                                      <p title={resultLabel(pa.result)}>B{pa.balls} S{pa.strikes} O{pa.outsBefore}-{pa.outsAfter}</p>
                                      <p>{battedBallLabel(pa.battedBallType)} / {directionLabel(pa.hitDirection)}</p>
                                      <p>打{pa.rbi} {pa.runScored ? "得" : ""} {pa.outsAfter > pa.outsBefore ? `O+${pa.outsAfter - pa.outsBefore}` : ""}</p>
                                      <p className="truncate">{pa.baseStateAfter || "残塁なし"}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
