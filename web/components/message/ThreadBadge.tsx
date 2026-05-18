import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ThreadInfo } from '@/lib/data/thread'
import type { UserMap } from '@/lib/data/users'
import { formatRelative } from '@/lib/utils/format'

export function ThreadBadge({
  threadInfo,
  href,
  userMap,
}: {
  threadInfo: ThreadInfo
  href: string
  userMap?: UserMap
}) {
  return (
    <Link
      href={href}
      className="group/thread mt-1.5 -ml-1 flex w-full max-w-2xl items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-border-soft hover:bg-surface hover:shadow-sm"
    >
      <div className="flex items-center gap-1">
        {threadInfo.authors.slice(0, 4).map((a, i) => {
          const latest = userMap?.byName?.[a.name]
          const av = latest?.avatarUrl ?? a.avatar
          return (
            <Avatar key={`${a.name}-${i}`} className="h-5 w-5 rounded-sm">
              {av && <AvatarImage src={av} alt={a.name} />}
              <AvatarFallback className="rounded-sm bg-border-soft text-[10px] font-medium text-text-strong">
                {a.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )
        })}
      </div>

      <span className="text-xs font-semibold text-text-link group-hover/thread:underline">
        {threadInfo.count}개 답글
      </span>

      <span className="grid items-center text-xs">
        <span className="col-start-1 row-start-1 whitespace-nowrap text-text-muted transition-opacity group-hover/thread:opacity-0">
          {threadInfo.lastReplyAt
            ? `마지막 답글 ${formatRelative(threadInfo.lastReplyAt)}`
            : ''}
        </span>
        <span className="col-start-1 row-start-1 whitespace-nowrap text-text-muted opacity-0 transition-opacity group-hover/thread:opacity-100">
          스레드 보기
        </span>
      </span>

      <ChevronRight />
    </Link>
  )
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="ml-auto shrink-0 text-text-muted opacity-0 transition-opacity group-hover/thread:opacity-100"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
