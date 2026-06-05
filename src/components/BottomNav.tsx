"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, List, PlusCircle, Settings } from "lucide-react";

const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/games/new", label: "新規記録", icon: PlusCircle },
  { href: "/games", label: "一覧", icon: List },
  { href: "/stats/players", label: "成績", icon: BarChart3 },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 shadow-[0_-8px_30px_rgba(24,24,27,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition ${
                active ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
