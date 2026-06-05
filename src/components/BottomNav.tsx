"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, List, PlusCircle, Settings, UserRound, Users } from "lucide-react";

const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/games/new", label: "新規記録", icon: PlusCircle },
  { href: "/games", label: "観戦記録", icon: List },
  { href: "/teams", label: "チーム", icon: Users },
  { href: "/players", label: "選手", icon: UserRound },
  { href: "/stats/players", label: "成績", icon: BarChart3 },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 shadow-[0_-8px_30px_rgba(24,24,27,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-4xl grid-cols-7 px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold transition ${
                active ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
