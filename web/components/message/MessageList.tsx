'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageRow } from './MessageRow'
import { DayDivider, StickyDayChip } from './DayDivider'
import { Button } from '@/components/ui/button'
import type { UserMap } from '@/lib/data/users'
import { toThreadInfo } from '@/lib/data/thread'
import { dayKey, within } from '@/lib/utils/format'

type Msg = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
  reply_count: number | null
  last_reply_at: string | null
  reply_authors: Array<{ name: string; avatar: string | null }> | null
}

type DayGroup = {
  day: string
  iso: string
  items: Array<{ msg: Msg; compact: boolean }>
}

const PAGE_SIZE = 50
const COMPACT_WINDOW_MS = 5 * 60 * 1000

export function MessageList({
  channelId,
  initialMessages,
  userMap,
}: {
  channelId: string
  initialMessages: Msg[]
  userMap: UserMap
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [hasMore, setHasMore] = useState(initialMessages.length >= PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chrono = useMemo(() => [...messages].reverse(), [messages])

  const dayGroups = useMemo<DayGroup[]>(() => {
    const groups: DayGroup[] = []
    let current: DayGroup | null = null
    let prev: Msg | undefined
    for (const m of chrono) {
      if (!m.timestamp) {
        if (current) {
          current.items.push({ msg: m, compact: false })
        }
        continue
      }
      const key = dayKey(m.timestamp)
      if (!current || current.day !== key) {
        current = { day: key, iso: m.timestamp, items: [] }
        groups.push(current)
        prev = undefined
      }
      const compact =
        !!prev &&
        !!prev.timestamp &&
        prev.author === m.author &&
        within(prev.timestamp, m.timestamp, COMPACT_WINDOW_MS)
      current.items.push({ msg: m, compact })
      prev = m
    }
    return groups
  }, [chrono])

  const loadMore = async () => {
    if (loading || !hasMore) return
    const oldest = messages[messages.length - 1]
    if (!oldest?.timestamp) return
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: older, error: fetchErr } = await supabase
      .from('document')
      .select(
        'id, author, author_image_url, timestamp, content, message_ts, reply_count, last_reply_at, reply_authors',
      )
      .eq('channel_id', channelId)
      .is('parent_id', null)
      .lt('timestamp', oldest.timestamp)
      .order('timestamp', { ascending: false })
      .limit(PAGE_SIZE)

    if (fetchErr) {
      setError('메시지를 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    if (!older || older.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }
    setMessages([...messages, ...older])
    setHasMore(older.length >= PAGE_SIZE)
    setLoading(false)
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
        메시지가 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col-reverse overflow-y-auto">
      <BottomMarker />

      <div className="flex flex-col">
        {dayGroups.map((group) => (
          <section key={group.day} className="relative">
            <DayDivider iso={group.iso} />
            <StickyDayChip iso={group.iso} />
            {group.items.map(({ msg, compact }) => (
              <MessageRow
                key={msg.id}
                message={msg}
                channelId={channelId}
                compact={compact}
                userMap={userMap}
                threadInfo={toThreadInfo(msg)}
              />
            ))}
          </section>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 px-6 py-4">
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hasMore ? (
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? '불러오는 중…' : '이전 메시지 더 보기'}
          </Button>
        ) : (
          <p className="text-xs text-text-muted">— 채널의 시작 —</p>
        )}
      </div>
    </div>
  )
}

function BottomMarker() {
  return (
    <div className="shrink-0 px-6 pb-6 pt-3">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-text-muted">
        <div className="h-px flex-1 bg-border-soft" />
        <span>여기가 최신</span>
        <div className="h-px flex-1 bg-border-soft" />
      </div>
    </div>
  )
}
