import type { AnalyticsSummary } from "@/lib/analytics";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

function weekdayLabel(date: string) {
  return new Intl.DateTimeFormat("en-PK", { weekday: "short" }).format(
    new Date(`${date}T00:00:00`),
  );
}

export function AudiencePanel({ analytics }: { analytics: AnalyticsSummary }) {
  const peak = Math.max(1, ...analytics.last7.map((day) => day.count));

  return (
    <section className="border-2 border-wheat-900 rounded-xl p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-wheat-900 pb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
            Audience
          </p>
          <h2 className="font-serif-display mt-1 text-3xl font-black leading-none">
            Visitor traffic
          </h2>
        </div>
        <p className="text-xs font-bold text-muted">Last 7 days on the public site</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="border border-wheat-900 rounded-xl p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
            Total page views
          </p>
          <p className="font-serif-display mt-1 text-4xl font-black">
            {formatCount(analytics.totalViews)}
          </p>
        </div>
        <div className="border border-wheat-900 rounded-xl p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
            Unique visitors
          </p>
          <p className="font-serif-display mt-1 text-4xl font-black">
            {formatCount(analytics.uniqueVisitors)}
          </p>
        </div>
        <div className="border border-wheat-900 rounded-xl p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
            Views today
          </p>
          <p className="font-serif-display mt-1 text-4xl font-black">
            {formatCount(analytics.todayViews)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-muted">
          Daily page views
        </p>
        <div className="flex items-end gap-2" style={{ height: "8rem" }}>
          {analytics.last7.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[11px] font-black text-muted">{day.count}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full bg-accent"
                  style={{
                    height: `${Math.max(2, Math.round((day.count / peak) * 100))}%`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-muted">
                {weekdayLabel(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
