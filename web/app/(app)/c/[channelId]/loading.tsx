/**
 * 채널 페이지 로딩 중 표시될 skeleton.
 * Next.js 가 자동으로 Suspense 경계로 감싸서 useFetch 중 보여줌.
 */
export default function ChannelLoading() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
        <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-zinc-200" />
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
      <div className="h-9 w-9 shrink-0 animate-pulse rounded bg-zinc-200" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-3 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  )
}
