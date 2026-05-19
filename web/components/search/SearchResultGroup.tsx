'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageRow } from '@/components/message/MessageRow'
import type { UserMap } from '@/lib/data/users'
import { toThreadInfo } from '@/lib/data/thread'

type Row = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
  channel_id: string | null
  parent_id: number | null
  reply_count: number | null
  last_reply_at: string | null
  reply_authors: Array<{ name: string; avatar: string | null }> | null
  thread_ts?: string | null
}

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select'

export function SearchResultGroup({
  channelId,
  channelName,
  rows,
  userMap,
  baseQs,
}: {
  channelId: string
  channelName: string
  rows: Row[]
  userMap: UserMap
  baseQs: string
}) {
  const router = useRouter()

  return (
    <section className="mb-6">
      <Link
        href={`/c/${channelId}`}
        className="sticky top-0 z-10 block border-b border-border-soft bg-surface/95 px-4 py-2 text-xs font-semibold text-text-muted backdrop-blur hover:text-text-strong md:px-6"
      >
        #{channelName}
        <span className="ml-2 font-normal text-text-muted">
          · {rows.length}건
        </span>
      </Link>

      <div className="space-y-2 px-3 py-3 md:px-4">
        {rows.map((r) => {
          const ti = toThreadInfo(r)
          const threadHref =
            r.thread_ts && r.channel_id
              ? `/search?${baseQs}&t=${encodeURIComponent(r.thread_ts)}&tc=${encodeURIComponent(r.channel_id)}`
              : undefined

          const onActivate = () => {
            if (threadHref) router.push(threadHref)
          }
          const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!threadHref) return
            const target = e.target as HTMLElement
            if (target.closest(INTERACTIVE_SELECTOR)) return
            onActivate()
          }
          const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!threadHref) return
            if (e.key !== 'Enter' && e.key !== ' ') return
            const target = e.target as HTMLElement
            if (target.closest(INTERACTIVE_SELECTOR)) return
            e.preventDefault()
            onActivate()
          }

          return (
            <div
              key={r.id}
              role={threadHref ? 'button' : undefined}
              tabIndex={threadHref ? 0 : undefined}
              onClick={threadHref ? onClick : undefined}
              onKeyDown={threadHref ? onKeyDown : undefined}
              aria-label={threadHref ? '스레드 보기' : undefined}
              data-clickable={threadHref ? 'true' : undefined}
              className="group/row overflow-hidden rounded-md border border-border-soft bg-surface transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-link data-[clickable=true]:cursor-pointer"
            >
              {r.parent_id && (
                <div className="border-b border-border-soft px-4 py-1 text-[11px] text-text-muted md:px-6">
                  스레드 답글
                </div>
              )}
              <MessageRow
                message={r}
                channelId={channelId}
                userMap={userMap}
                threadInfo={ti}
                threadHref={threadHref}
                showActions={true}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
