import Link from "next/link";
import { BarChart3, BookOpen, List, PlusCircle, Trophy } from "lucide-react";

export default function Home() {
  const actions = [
    { href: "/games/new", label: "新しい観戦記録を作る", icon: PlusCircle, color: "bg-emerald-700 text-white" },
    { href: "/games", label: "観戦記録一覧を見る", icon: List, color: "bg-stone-900 text-white" },
    { href: "/stats/teams", label: "チーム成績を見る", icon: Trophy, color: "bg-amber-600 text-white" },
    { href: "/stats/players", label: "個人成績を見る", icon: BarChart3, color: "bg-white text-stone-900 ring-1 ring-stone-200" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-md border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#166534_0_36px,#f59e0b_36px_72px,#292524_72px_108px)]" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
              <BookOpen className="h-4 w-4" />
              観戦ログ兼スコアブック
            </div>
            <div>
              <h1 className="text-4xl font-black leading-tight text-stone-950 sm:text-5xl">Score Base</h1>
              <p className="mt-2 text-lg font-bold text-stone-700">観戦の記憶も、試合の記録も、ひとつのベースに。</p>
            </div>
            <p className="max-w-xl text-base leading-7 text-stone-600">
              Score Baseは、観戦の思い出と試合の記録をひとつに残せる野球記録アプリです。ライトな観戦メモから、両チームのスタメン・スコア記録、ボタン入力式の詳細スコアブックまで、用途に合わせて3つの記録モードを選べます。
            </p>
          </div>
          <div className="grid grid-cols-9 gap-1 rounded-md bg-stone-900 p-4 text-center font-mono text-sm font-black text-lime-200 shadow-inner">
            {["TEAM", "1", "2", "3", "4", "5", "6", "7", "R", "AWAY", "0", "1", "0", "2", "0", "0", "1", "4", "HOME", "1", "0", "0", "0", "3", "0", "1", "5"].map((item, index) => (
              <span key={`${item}-${index}`} className="rounded-sm bg-stone-800 px-1 py-2">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className={`flex min-h-24 items-center justify-between rounded-md p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${action.color}`}>
              <span className="text-base font-black">{action.label}</span>
              <Icon className="h-7 w-7" />
            </Link>
          );
        })}
      </section>
    </main>
  );
}
