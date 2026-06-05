import Link from "next/link";
import { ClipboardList, NotebookPen, Table2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const modes = [
  { href: "/games/new/watch", title: "観戦記録のみ", body: "日付、球場、感想、MVPなどをすばやく残します。", icon: NotebookPen },
  { href: "/games/new/simple", title: "簡易記録", body: "スタメン、イニングスコア、投手や得点経過も記録します。", icon: ClipboardList },
  { href: "/games/new/scorebook", title: "詳細スコアブック", body: "SBO、打席結果、打球方向をボタンで構造化記録します。", icon: Table2 },
];

export default function NewGamePage() {
  return (
    <PageShell title="新しい観戦記録" lead="最初に記録モードを選択してください。あとから詳細ページで確認・編集できます。">
      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link key={mode.href} href={mode.href} className="flex min-h-52 flex-col justify-between rounded-md border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">
              <Icon className="h-8 w-8 text-emerald-700" />
              <div>
                <h2 className="text-lg font-black text-stone-950">{mode.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{mode.body}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
