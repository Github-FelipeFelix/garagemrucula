export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 h-4 w-16 animate-pulse rounded bg-surface-2" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-2" />
        <div className="space-y-4">
          <div className="h-9 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
          <div className="h-12 animate-pulse rounded-full bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
