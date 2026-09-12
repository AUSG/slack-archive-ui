/**
 * UI 가 그리는 메시지·채널 형태. 백엔드 응답(lib/api/types.ts)을 `lib/data/adapt.ts` 가 여기로 바꾼다.
 *
 * 예전에는 Supabase `document` row 형태가 다섯 곳에 인라인으로 중복 정의돼 있었다. 하나로 모은다.
 * 식별자는 Slack id 다. 이름·아바타는 adapt 단계에서 `GET /users` 로 채운다 (D7).
 */
export type Msg = {
  id: string // = message_ts. 채널 안에서 고유
  author_id: string | null // Slack user id (봇은 bot id)
  author: string | null // 표시 이름. 모르면 id
  author_image_url: string | null
  timestamp: string | null // ISO
  content: string | null
  message_ts: string | null
  channel_id: string
  is_reply: boolean
  thread_ts: string | null // 답글이면 부모 ts, 부모면 자기 ts (스레드 열기용)
  reply_count: number | null
  last_reply_at: string | null // ISO
  reply_authors: Array<{ name: string; avatar: string | null }> | null
  files: MsgFile[]
}

/** 첨부. `url` 은 같은 오리진의 중계 라우트. status 가 available 일 때만 바이너리가 있다. */
export type MsgFile = {
  id: string
  name: string | null
  mimetype: string | null
  status: 'available' | 'deleted' | 'too_large' | 'broken' | 'not_image' | 'pending'
  url: string
}

export type Channel = { id: string; name: string; msg_count: number | null; is_private?: boolean }
