import Link from "next/link";

export function AccessStateCard({
  title,
  message,
  href,
  actionLabel,
}: {
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-lg font-black text-amber-950">{title}</h2>
      <p className="mt-2 text-sm font-bold leading-6 text-amber-900">{message}</p>
      {href && actionLabel ? (
        <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-amber-700 px-4 text-sm font-bold text-white" href={href}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
