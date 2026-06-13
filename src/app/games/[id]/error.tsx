"use client";

import Link from "next/link";

export default function GameRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-md border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Score Base</p>
        <h1 className="mt-2 text-2xl font-black text-stone-950">試合記録を読み込めませんでした</h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          DB保存済み試合の取得中に問題が発生しました。秘密情報や内部エラーは表示していません。
        </p>
        {error.digest ? <p className="mt-3 break-all rounded-md bg-white px-3 py-2 text-xs font-bold text-stone-600">digest: {error.digest}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white">再試行</button>
          <Link className="rounded-md bg-white px-4 py-3 text-sm font-bold text-stone-800 ring-1 ring-stone-200" href="/games">観戦記録一覧へ</Link>
          <Link className="rounded-md bg-white px-4 py-3 text-sm font-bold text-stone-800 ring-1 ring-stone-200" href="/">ホームへ</Link>
        </div>
      </section>
    </main>
  );
}
