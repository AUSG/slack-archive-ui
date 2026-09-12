import { NextResponse } from 'next/server'
import { getChannels, searchMessages } from '@/lib/api/archive'
import { ApiError } from '@/lib/api/client'
import { getUserMap } from '@/lib/data/users'

const PAGE_SIZE = 5
const MAX_Q_LEN = 200

/** ⌘K 패널의 메시지 검색. 백엔드 /search 를 5건으로. 권한은 백엔드가 건다. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = (searchParams.get('q') ?? '').trim()

  if (!raw) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 })
  }
  if (raw.length > MAX_Q_LEN) {
    return NextResponse.json({ error: 'q too long' }, { status: 400 })
  }

  try {
    const [channels, userMap, res] = await Promise.all([
      getChannels(),
      getUserMap(),
      searchMessages({ q: raw, limit: PAGE_SIZE, offset: 0 }),
    ])
    const channelName = new Map(channels.map((c) => [c.id, c.name ?? c.id]))
    const messages = res.messages.map((m) => {
      const authorId = m.user_id ?? m.bot_id
      return {
        id: m.ts,
        channel_id: m.channel_id,
        channel_name: channelName.get(m.channel_id) ?? null,
        author: (authorId && userMap.byId[authorId]?.displayName) ?? authorId ?? null,
        content_excerpt: m.text.slice(0, 80),
        message_ts: m.ts,
        timestamp: m.posted_at,
        thread_ts: m.thread_ts ?? m.ts,
      }
    })
    return NextResponse.json({ messages })
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return NextResponse.json({ error: 'archive api error' }, { status })
  }
}
