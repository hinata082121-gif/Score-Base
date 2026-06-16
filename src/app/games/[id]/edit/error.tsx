"use client";

import Link from "next/link";

export default function EditGameError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <section className="rounded-md border border-red-200 bg-red-50 p-5">
        <h1 className="text-xl font-black text-red-900">観戦記録の編集画面を読み込めませんでした</h1>
        <p className="mt-2 text-sm font-bold text-red-800">再試行しても解消しない場合は、Vercel Runtime Logsでこのrouteとdigestを確認してください。</p>
        {error.digest ? <p className="mt-3 rounded bg-white px-3 py-2 text-xs font-bold text-red-700">digest: {error.digest}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="rounded-md bg-red-700 px-3 py-2 text-sm font-bold text-white">再試行</button>
          <Link href="/games" className="rounded-md bg-white px-3 py-2 text-sm font-bold text-stone-800 ring-1 ring-stone-300">一覧へ戻る</Link>
        </div>
      </section>
    </main>
  );
}
