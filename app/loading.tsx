export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-label="Loading">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        <span className="size-2 animate-pulse rounded-full bg-primary" />
        Loading workspace…
      </div>
    </div>
  )
}
