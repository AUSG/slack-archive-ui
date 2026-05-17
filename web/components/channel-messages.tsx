'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/components/message'
import type { UserMap } from '@/lib/data/users'
import { buildThreadInfoMap, type ThreadInfo } from '@/lib/data/thread'

type Msg = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
}

const PAGE_SIZE = 50

export function ChannelMessages({
  channelId,
  initialMessages,
  initialThreadInfo,
  userMap,
}: {
  channelId: string
  initialMessages: Msg[]
  initialThreadInfo: Record<number, ThreadInfo>
  userMap: UserMap
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [threadInfo, setThreadInfo] =
    useState<Record<number, ThreadInfo>>(initialThreadInfo)
  const [hasMore, setHasMore] = useState(
    initialMessages.length >= PAGE_SIZE,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMore = async () => {
    if (loading || !hasMore) return
    const oldest = messages[messages.length - 1]
    if (!oldest?.timestamp) return

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: older, error: fetchErr } = await supabase
      .from('document')
      .select('id, author, author_image_url, timestamp, content, message_ts')
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

    // 새 배치의 스레드 정보 (작성자 + 마지막 답글 시간 포함)
    const newIds = older.map((m) => m.id)
    const { data: replies } = await supabase
      .from('document')
      .select('parent_id, author, author_image_url, timestamp')
      .in('parent_id', newIds)
      .order('timestamp', { ascending: true })

    const newInfo = buildThreadInfoMap(replies ?? [])

    setMessages([...messages, ...older])
    setThreadInfo({ ...threadInfo, ...newInfo })
    setHasMore(older.length >= PAGE_SIZE)
    setLoading(false)
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        메시지가 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col-reverse overflow-y-auto">
      {/* DOM 첫 번째 = visual 최하단. "여기가 최신" 마커 + 여백. */}
      <BottomMarker />

      <div className="flex flex-col-reverse">
        {messages.map((m) => (
          <Message
            key={m.id}
            message={m}
            channelId={channelId}
            threadInfo={threadInfo[m.id]}
            userMap={userMap}
          />
        ))}
      </div>

      {/* DOM 마지막 = visual 상단. 추가 로드 트리거. */}
      <div className="flex flex-col items-center gap-2 px-6 py-4">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '불러오는 중…' : '이전 메시지 더 보기'}
          </button>
        ) : (
          <p className="text-xs text-zinc-400">— 채널의 시작 —</p>
        )}
      </div>
    </div>
  )
}

function BottomMarker() {
  return (
    <div className="shrink-0 px-6 pb-6 pt-3">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-400">
        <div className="h-px flex-1 bg-zinc-100" />
        <span>여기가 최신</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>
    </div>
  )
}
