/** 백엔드 아카이브 API(slack-crawler `/api/v1`, 9단계)의 응답 형태. 식별자는 전부 Slack id (D7). */

export type ApiChannel = {
  id: string
  name: string | null
  is_private: boolean
  is_archived: boolean
  message_count: number
}

export type ApiFile = {
  id: string
  name: string | null
  title: string | null
  mimetype: string | null
  size: number | null
  status: 'available' | 'deleted' | 'too_large' | 'broken' | 'not_image' | 'pending'
  url: string
}

export type ApiReaction = { name: string; count: number; users: string[] }

export type ApiMessage = {
  channel_id: string
  ts: string
  thread_ts: string | null // 답글이면 부모 ts, 부모·단발은 null
  user_id: string | null
  bot_id: string | null
  subtype: string | null
  text: string
  posted_at: string // ISO
  edited_ts: string | null
  reply_count: number
  latest_reply: string | null // Slack ts
  reply_user_ids: string[]
  reactions: ApiReaction[]
  files: ApiFile[]
}

export type ApiMessagesPage = { messages: ApiMessage[]; next_before: string | null }
export type ApiThread = { root: ApiMessage | null; replies: ApiMessage[] }

export type ApiUser = {
  id: string
  is_bot: boolean
  deleted: boolean
  profile: {
    display_name?: string
    real_name?: string
    title?: string
    image_24?: string
    image_32?: string
    image_48?: string
    image_72?: string
    image_192?: string
    image_512?: string
  }
}

export type ApiMember = {
  user_id: string
  is_bot: boolean
  deleted: boolean
  profile: ApiUser['profile']
  since: string | null
}

export type ApiMembers = {
  channel_id: string
  is_private: boolean
  members: ApiMember[]
}

export type ApiSearch = { messages: ApiMessage[]; limit: number; offset: number }
