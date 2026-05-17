export default function SearchLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
        <div className="h-5 w-16 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-9 w-full animate-pulse rounded bg-zinc-100" />
      </header>
      <div className="flex-1 space-y-4 px-6 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-200" />
            <div className="flex gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded bg-zinc-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
