import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-border-soft bg-surface px-4 py-3 md:px-6">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-9 w-full" />
      </header>
      <div className="flex-1 space-y-4 px-6 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
