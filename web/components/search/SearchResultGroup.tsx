import Link from 'next/link'
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
}

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
  return (
    <section className="mb-4">
      <Link
        href={`/c/${channelId}`}
        className="sticky top-0 z-10 block border-b border-border-soft bg-surface/95 px-6 py-2 text-xs font-semibold text-text-muted backdrop-blur hover:text-text-strong"
      >
        #{channelName}
        <span className="ml-2 font-normal text-text-muted">
          · {rows.length}건
        </span>
      </Link>
      <div className="divide-y divide-border-soft">
        {rows.map((r) => {
          const ti = toThreadInfo(r)
          const isTop = r.parent_id === null
          const threadHref =
            isTop && (ti?.count ?? 0) > 0 && r.channel_id && r.message_ts
              ? `/search?${baseQs}&t=${encodeURIComponent(r.message_ts)}&tc=${encodeURIComponent(r.channel_id)}`
              : undefined
          return (
            <div key={r.id} className="bg-surface hover:bg-surface-hover">
              {r.parent_id && (
                <div className="px-6 pt-2 text-[11px] text-text-muted">
                  스레드 답글
                </div>
              )}
              <MessageRow
                message={r}
                channelId={channelId}
                userMap={userMap}
                threadInfo={ti}
                threadHref={threadHref}
                showActions={false}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
