"use client";

import Link from "next/link";
import { LogIn, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { loadCurrentUser, loadWorkspaceContext, logoutUser, onAuthChanged, saveWorkspaceContext, type AuthUser, type WorkspaceContext } from "@/lib/auth/clientAuth";
import { loadTeams } from "@/lib/masterStorage";
import { getUserTeamIds, onTeamAccessChanged } from "@/lib/teamAccessStorage";

export function AppHeader() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [context, setContext] = useState<WorkspaceContext>({ type: "personal", label: "個人ワークスペース" });
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    function refresh() {
      setUser(loadCurrentUser());
      setContext(loadWorkspaceContext());
      forceRefresh((value) => value + 1);
    }
    refresh();
    const unsubscribeAuth = onAuthChanged(refresh);
    const unsubscribeTeam = onTeamAccessChanged(refresh);
    return () => {
      unsubscribeAuth();
      unsubscribeTeam();
    };
  }, []);

  const teamIds = getUserTeamIds(user?.id);
  const teams = loadTeams().filter((team) => teamIds.includes(team.id));
  const options = [
    { value: "personal", label: "個人ワークスペース" },
    ...teams.map((team) => ({ value: `team:${team.id}`, label: team.name })),
  ];

  function changeContext(value: string) {
    if (value === "personal") {
      const next = { type: "personal" as const, label: "個人ワークスペース" };
      setContext(next);
      saveWorkspaceContext(next);
      return;
    }
    const teamId = value.replace("team:", "");
    const team = loadTeams().find((item) => item.id === teamId);
    const next = { type: "team" as const, teamId, label: team?.name ?? "チームワークスペース" };
    setContext(next);
    saveWorkspaceContext(next);
  }

  function logout() {
    logoutUser();
    void logoutAction();
    setUser(null);
    setContext({ type: "personal", label: "個人ワークスペース" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link className="mr-auto flex items-center gap-2 text-stone-950" href="/">
          <span className="grid size-9 place-items-center rounded-md bg-emerald-700 text-sm font-black text-white">SB</span>
          <span>
            <span className="block text-base font-black leading-5">Score Base</span>
            <span className="block text-xs font-bold text-stone-500">観戦と試合記録</span>
          </span>
        </Link>
        {user ? (
          <>
            <select
              aria-label="ワークスペース"
              className="min-h-10 max-w-48 rounded-md border border-stone-300 bg-white px-2 text-xs font-bold text-stone-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              value={context.type === "team" ? `team:${context.teamId}` : "personal"}
              onChange={(event) => changeContext(event.target.value)}
            >
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <Link className="inline-flex min-h-10 items-center gap-1 rounded-md bg-stone-100 px-3 text-xs font-bold text-stone-800" href="/account">
              <UserRound size={16} aria-hidden="true" />
              {user.displayName || user.name}
            </Link>
            <Link className="inline-flex min-h-10 items-center rounded-md bg-white px-2 text-stone-700 ring-1 ring-stone-200" aria-label="アカウント設定" href="/account/settings">
              <Settings size={18} aria-hidden="true" />
            </Link>
            <button className="inline-flex min-h-10 items-center rounded-md bg-white px-2 text-stone-700 ring-1 ring-stone-200" aria-label="ログアウト" type="button" onClick={logout}>
              <LogOut size={18} aria-hidden="true" />
            </button>
          </>
        ) : (
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-700 px-3 text-xs font-bold text-white" href="/login">
            <LogIn size={16} aria-hidden="true" />
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
