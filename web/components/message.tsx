import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { renderSlackMarkup } from '@/lib/slack/format'
import type { UserMap } from '@/lib/data/users'

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
  replyCount = 0,
  channelId,
  compact = false,
  userMap,
  threadHref,
}: {
  message: Msg
  replyCount?: number
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
          if (replyCount <= 0) return null
          const href =
            threadHref ??
            (channelId && message.message_ts
              ? `/c/${channelId}?t=${message.message_ts}`
              : null)
          if (!href) return null
          return (
            <Link
              href={href}
              className="mt-1 inline-flex items-center gap-1.5 rounded border border-transparent px-1.5 py-0.5 text-xs font-medium text-[#1264a3] hover:border-zinc-200 hover:bg-white"
            >
              <ReplyIcon />
              {replyCount}개 답글
            </Link>
          )
        })()}
      </div>
    </div>
  )
}

function ReplyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
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
