import Link from "next/link";

type StatsCardProps = {
  label: string;
  value: string;
  detail: string;
  /** When set, the whole card becomes a link to the matching filtered view. */
  href?: string;
  active?: boolean;
};

export function StatsCard({
  label,
  value,
  detail,
  href,
  active = false,
}: StatsCardProps) {
  const body = (
    <>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="font-serif-display mt-2 text-4xl font-black">{value}</p>
      <p className="mt-2 border-t border-wheat-900 pt-2 text-sm text-muted">
        {detail}
      </p>
    </>
  );

  const className = `block rounded-xl border-2 p-4 ${
    active ? "border-accent bg-elevated" : "border-wheat-900"
  }`;

  if (!href) {
    return <section className={className}>{body}</section>;
  }

  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`${className} cursor-pointer transition-colors hover:border-accent hover:bg-elevated`}
    >
      {body}
    </Link>
  );
}
