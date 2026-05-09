type StatsCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatsCard({ label, value, detail }: StatsCardProps) {
  return (
    <section className="border-2 border-black p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>
      <p className="font-serif-display mt-2 text-4xl font-black">{value}</p>
      <p className="mt-2 border-t border-black pt-2 text-sm text-zinc-700">
        {detail}
      </p>
    </section>
  );
}
