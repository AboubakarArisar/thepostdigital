type StatsCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatsCard({ label, value, detail }: StatsCardProps) {
  return (
    <section className="border-2 border-wheat-900 rounded-xl p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="font-serif-display mt-2 text-4xl font-black">{value}</p>
      <p className="mt-2 border-t border-wheat-900 pt-2 text-sm text-muted">
        {detail}
      </p>
    </section>
  );
}
