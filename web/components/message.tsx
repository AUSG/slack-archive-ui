import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { renderSlackMarkup } from '@/lib/slack/format'
import type { UserMap } from '@/lib/data/users'
import type { ThreadInfo } from '@/lib/data/thread'

type Msg = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
}

export function Message({
  message,
  threadInfo,
  channelId,
  compact = false,
  userMap,
  threadHref,
}: {
  message: Msg
  threadInfo?: ThreadInfo
  channelId?: string
  compact?: boolean
  userMap?: UserMap
  /** 직접 지정하면 우선 사용. 없으면 channelId + message_ts 로 /c/.. URL 생성. */
  threadHref?: string
}) {
  const time = message.timestamp ? formatTime(message.timestamp) : ''
  const author = message.author ?? '—'

  return (
    <div
      className={
        compact
          ? 'flex gap-3 px-4 py-1.5'
          : 'flex gap-3 px-6 py-1.5 hover:bg-zinc-50'
      }
    >
      <Avatar className="mt-0.5 h-9 w-9 shrink-0 rounded">
        {message.author_image_url && (
          <AvatarImage src={message.author_image_url} alt={author} />
        )}
        <AvatarFallback className="rounded bg-zinc-200 text-xs text-zinc-700">
          {author.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-zinc-900">{author}</span>
          <span className="text-xs text-zinc-500">{time}</span>
        </div>
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-800">
          {renderSlackMarkup(message.content, userMap)}
        </div>
        {(() => {
          if (!threadInfo || threadInfo.count <= 0) return null
          const href =
            threadHref ??
            (channelId && message.message_ts
              ? `/c/${channelId}?t=${message.message_ts}`
              : null)
          if (!href) return null
          return (
            <Link
              href={href}
              className="group/thread mt-1.5 -ml-1 inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex -space-x-1">
                {threadInfo.authors.map((a, i) => (
                  <Avatar
                    key={`${a.name}-${i}`}
                    className="h-5 w-5 rounded ring-2 ring-white"
                  >
                    {a.avatar && (
                      <AvatarImage src={a.avatar} alt={a.name} />
                    )}
                    <AvatarFallback className="rounded bg-zinc-300 text-[10px] font-medium text-zinc-700">
                      {a.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs font-semibold text-[#1264a3] group-hover/thread:underline">
                {threadInfo.count}개 답글
              </span>
              {threadInfo.lastReplyAt && (
                <span className="text-xs text-zinc-500">
                  마지막 답글 {formatRelative(threadInfo.lastReplyAt)}
                </span>
              )}
            </Link>
          )
        })()}
      </div>
    </div>
  )
}

function formatRelative(ts: string): string {
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const yearAgo = today.getFullYear() !== d.getFullYear()

  if (sameDay) {
    return d.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  if (yearAgo) {
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  return d.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
