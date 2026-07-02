export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-surface-2" />
      <div className="mb-8 h-8 w-40 animate-pulse rounded bg-surface-2" />
      <div className="mb-8 h-20 animate-pulse rounded-2xl bg-surface" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="aspect-[4/3] animate-pulse bg-surface-2" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
