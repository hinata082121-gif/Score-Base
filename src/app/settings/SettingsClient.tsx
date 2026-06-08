"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { defaultSettings } from "@/lib/constants";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { ScoreBaseSettings } from "@/lib/types";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-stone-800">
      {label}
      <input className="h-5 w-5 accent-emerald-700" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function SettingsClient() {
  const [settings, setSettings] = useState<ScoreBaseSettings>(defaultSettings);
  const [saved, setSaved] = useState("未保存");
  const [runtime, setRuntime] = useState({ origin: "", share: false });

  useEffect(() => {
    setSettings(loadSettings());
    setRuntime({ origin: window.location.origin, share: Boolean(navigator.share) });
  }, []);

  function patch(patchValue: Partial<ScoreBaseSettings>) {
    const next = { ...settings, ...patchValue };
    setSettings(next);
    saveSettings(next);
    setSaved("保存済み");
  }

  return (
    <PageShell title="設定" lead="詳細スコアブック入力の追加項目と出力形式をローカル設定として保存します。">
      <div className="space-y-5">
        <p className="text-sm font-bold text-emerald-700">保存状態: {saved}</p>
        <section className="grid gap-3 sm:grid-cols-2">
          <Toggle label="球速記録を使う" checked={settings.useSpeed} onChange={(checked) => patch({ useSpeed: checked })} />
          <Toggle label="球種記録を使う" checked={settings.usePitchType} onChange={(checked) => patch({ usePitchType: checked })} />
          <Toggle label="コース記録を使う" checked={settings.useCourse} onChange={(checked) => patch({ useCourse: checked })} />
          <Toggle label="打球形式記録を使う" checked={settings.useBattedBallType} onChange={(checked) => patch({ useBattedBallType: checked })} />
          <Toggle label="打球方向記録を使う" checked={settings.useHitDirection} onChange={(checked) => patch({ useHitDirection: checked })} />
        </section>
        <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-bold text-stone-700">デフォルト出力形式<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={settings.defaultStyle} onChange={(e) => patch({ defaultStyle: e.target.value as ScoreBaseSettings["defaultStyle"] })}><option value="WASEDA">早稲田式</option><option value="KEIO">慶應式</option></select></label>
          <label className="text-sm font-bold text-stone-700">スコアブック表示密度<select className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3" value={settings.density} onChange={(e) => patch({ density: e.target.value as ScoreBaseSettings["density"] })}><option value="STANDARD">標準</option><option value="COMPACT">コンパクト</option></select></label>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">データ管理</h2>
          <p className="mt-2 text-sm text-stone-600">localStorageのバックアップ、削除、DB移行準備を行います。</p>
          <Link className="mt-3 inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 text-sm font-bold text-white" href="/settings/data">データ管理を開く</Link>
        </section>
        <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black text-stone-950">公開前チェック</h2>
          <div className="mt-3 grid gap-2 text-sm text-stone-700">
            <p><span className="font-bold">現在のアプリURL:</span> {runtime.origin || "取得中"}</p>
            <p><span className="font-bold">共有URL生成時のbase URL:</span> {runtime.origin || "取得中"}</p>
            <p><span className="font-bold">Web Share API:</span> {runtime.share ? "利用可能" : "未対応"}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white" href="/settings/deployment">公開環境診断</Link>
            <Link className="inline-flex min-h-11 items-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-800" href="/settings/release-checklist">QAチェックリスト</Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
