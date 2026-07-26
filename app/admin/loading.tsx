// The dashboard is force-dynamic (DB + analytics on every request), so every
// filter link waits on a server render. This is what fills that gap — Next.js
// swaps it in automatically for any /admin navigation.
function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-wheat-900/40 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading the newsroom"
      className="grid min-h-screen animate-pulse md:grid-cols-[16rem_1fr]"
    >
      <div className="hidden border-r-2 border-wheat-900 p-4 md:block">
        <Block className="h-6 w-32" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Block key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <section className="p-4 md:p-6">
        <div className="border-b-4 border-wheat-900 pb-4">
          <Block className="h-3 w-24" />
          <Block className="mt-3 h-12 w-72" />
          <Block className="mt-3 h-4 w-full max-w-2xl" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Block key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="mt-6 border-2 border-wheat-900">
          <div className="border-b-2 border-wheat-900 bg-elevated px-3 py-3">
            <Block className="h-4 w-40" />
          </div>
          <div className="divide-y divide-wheat-900">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-3">
                <Block className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
