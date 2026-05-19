import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HIDDEN_NAME_LIKE, HIDDEN_NAME_REGEX } from '@/lib/data/channel-filter'

const PAGE_SIZE = 5
const MAX_Q_LEN = 200

type RpcRow = {
  id: number
  author: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
  channel_id: string | null
  parent_id: number | null
  reply_count: number | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = (searchParams.get('q') ?? '').trim()

  if (!raw) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 })
  }
  if (raw.length > MAX_Q_LEN) {
    return NextResponse.json({ error: 'q too long' }, { status: 400 })
  }

  const supabase = await createClient()

  const [{ data: channels, error: channelsError }, { data: rpcData, error }] = await Promise.all([
    supabase
      .from('channel')
      .select('id, name')
      .not('name', 'ilike', HIDDEN_NAME_LIKE)
      .not('name', 'imatch', HIDDEN_NAME_REGEX),
    supabase.rpc('search_messages', {
      q: raw,
      ch: null,
      author_name: null,
      date_from: null,
      date_to: null,
      page_size: PAGE_SIZE,
      page_offset: 0,
    }),
  ])

  if (channelsError) {
    return NextResponse.json({ error: channelsError.message }, { status: 500 })
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const channelMap = new Map((channels ?? []).map((c) => [c.id, c.name]))

  const filtered = ((rpcData ?? []) as RpcRow[])
    .filter((r) => r.channel_id && channelMap.has(r.channel_id))
    .slice(0, PAGE_SIZE)

  const parentIds = Array.from(
    new Set(filtered.map((r) => r.parent_id).filter((id): id is number => id !== null)),
  )
  let parentTsById = new Map<number, string>()
  if (parentIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from('document')
      .select('id, message_ts')
      .in('id', parentIds)
    if (parentsError) {
      return NextResponse.json({ error: parentsError.message }, { status: 500 })
    }
    parentTsById = new Map(
      (parents ?? [])
        .filter((p) => p.id != null && p.message_ts != null)
        .map((p) => [p.id as number, p.message_ts as string]),
    )
  }

  const messages = filtered.map((r) => {
    const isReply = r.parent_id !== null
    const thread_ts = isReply
      ? parentTsById.get(r.parent_id as number) ?? r.message_ts
      : r.message_ts
    return {
      id: r.id,
      channel_id: r.channel_id,
      channel_name: channelMap.get(r.channel_id!) ?? null,
      author: r.author,
      content_excerpt: (r.content ?? '').slice(0, 80),
      message_ts: r.message_ts,
      timestamp: r.timestamp,
      thread_ts,
    }
  })

  return NextResponse.json({ messages })
}
