import type { ReactNode } from "react";

export function PageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Score Base</p>
        <h1 className="mt-2 text-2xl font-black text-stone-950 sm:text-3xl">{title}</h1>
        {lead ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{lead}</p> : null}
      </header>
      {children}
    </main>
  );
}
