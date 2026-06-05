"use client";

import { RotateCcw } from "lucide-react";
import type { RunnerState } from "@/lib/types";

const baseButton = "min-h-10 rounded-md px-3 text-xs font-bold transition";
const inputClass = "min-h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export function RunnerDiamond({
  runnerState,
  onChange,
  onAdvance,
  onScore,
  onOut,
  onClear,
}: {
  runnerState: RunnerState;
  onChange: (state: RunnerState) => void;
  onAdvance: (base: keyof RunnerState) => void;
  onScore: (base: keyof RunnerState) => void;
  onOut: (base: keyof RunnerState) => void;
  onClear: () => void;
}) {
  const bases: Array<{ key: keyof RunnerState; label: string; grid: string }> = [
    { key: "second", label: "二塁", grid: "col-start-2 row-start-1" },
    { key: "third", label: "三塁", grid: "col-start-1 row-start-2" },
    { key: "first", label: "一塁", grid: "col-start-3 row-start-2" },
  ];

  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-stone-900">ランナー状況</h3>
        <button type="button" className={`${baseButton} bg-white text-stone-700 ring-1 ring-stone-300`} onClick={onClear}>
          <RotateCcw className="mr-1 inline h-4 w-4" />
          全クリア
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[240px_1fr] lg:items-center">
        <div className="mx-auto grid h-56 w-56 grid-cols-3 grid-rows-3 place-items-center rounded-md bg-emerald-800 p-3 shadow-inner">
          <div className="col-start-2 row-start-2 h-20 w-20 rotate-45 rounded-sm border-2 border-white/90 bg-amber-100" />
          <div className="col-start-2 row-start-3 rounded-md bg-white px-3 py-2 text-xs font-black text-stone-800 shadow">本塁</div>
          {bases.map((base) => (
            <div key={base.key} className={`${base.grid} z-10 flex h-20 w-20 rotate-45 items-center justify-center rounded-sm border-2 border-white bg-stone-100 shadow`}>
              <div className="-rotate-45 text-center">
                <p className="text-xs font-black text-stone-700">{base.label}</p>
                <p className="mt-1 max-w-16 truncate text-[11px] font-bold text-emerald-800">{runnerState[base.key] || "空"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          {bases.map((base) => (
            <div key={base.key} className="grid gap-2 rounded-md bg-white p-3 ring-1 ring-stone-200 sm:grid-cols-[88px_1fr_auto_auto_auto] sm:items-center">
              <p className="text-sm font-black text-stone-800">{base.label}</p>
              <input
                className={inputClass}
                value={runnerState[base.key]}
                onChange={(event) => onChange({ ...runnerState, [base.key]: event.target.value })}
                placeholder="ランナー名・背番号"
              />
              <button type="button" className={`${baseButton} bg-emerald-700 text-white`} onClick={() => onAdvance(base.key)}>進塁</button>
              <button type="button" className={`${baseButton} bg-amber-100 text-amber-950`} onClick={() => onScore(base.key)}>得点</button>
              <button type="button" className={`${baseButton} bg-red-50 text-red-700`} onClick={() => onOut(base.key)}>アウト</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
