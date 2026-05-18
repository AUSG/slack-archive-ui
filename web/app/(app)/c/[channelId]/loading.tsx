import { Skeleton } from '@/components/ui/skeleton'

export default function ChannelLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-border-soft bg-surface px-4 py-3 md:px-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-24" />
      </header>
      <div className="flex-1 space-y-4 px-6 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function MessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-9 w-9 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
