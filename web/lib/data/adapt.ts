import type { ApiChannel, ApiMessage } from '@/lib/api/types'
import type { UserMap } from './users'
import type { Channel, Msg } from './types'

function tsToIso(ts: string | null): string | null {
  if (!ts) return null
  const n = Number(ts)
  return Number.isFinite(n) ? new Date(n * 1000).toISOString() : null
}

export function toChannel(c: ApiChannel): Channel {
  return { id: c.id, name: c.name ?? c.id, msg_count: c.message_count, is_private: c.is_private }
}

export function toMsg(m: ApiMessage, userMap: UserMap): Msg {
  const authorId = m.user_id ?? m.bot_id
  const profile = authorId ? userMap.byId[authorId] : undefined
  return {
    id: m.ts,
    author_id: authorId,
    author: profile?.displayName ?? authorId,
    author_image_url: profile?.avatarUrl ?? null,
    timestamp: m.posted_at,
    content: m.text,
    message_ts: m.ts,
    channel_id: m.channel_id,
    is_reply: m.thread_ts !== null,
    thread_ts: m.thread_ts ?? m.ts,
    reply_count: m.reply_count,
    last_reply_at: tsToIso(m.latest_reply),
    reply_authors: m.reply_user_ids.map((uid) => {
      const p = userMap.byId[uid]
      return { name: p?.displayName ?? uid, avatar: p?.avatarUrl ?? null }
    }),
    files: m.files.map((f) => ({
      id: f.id,
      name: f.name ?? f.title,
      mimetype: f.mimetype,
      status: f.status,
      url: `/api/archive/files/${f.id}`,
    })),
  }
}
