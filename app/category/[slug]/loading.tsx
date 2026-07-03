export default function Loading() {
  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-32">
      <div className="h-3 w-20 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-10 w-56 animate-pulse rounded bg-surface" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-surface-hover" />
            <div className="space-y-2 p-4">
              <div className="h-2 w-16 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
