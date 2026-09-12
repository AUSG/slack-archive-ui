import type { Msg } from './types'

/**
 * 스레드 뱃지에 필요한 집계 정보.
 * - count: 답글 수
 * - authors: 답글한 사람 (중복 제거)
 * - lastReplyAt: 가장 늦은 답글 시각 (ISO)
 *
 * 값은 백엔드 메시지의 reply_count / latest_reply / reply_user_ids 에서 오고 adapt 가 이름·아바타를 채운다.
 */
export type ThreadInfo = {
  count: number
  authors: Array<{ name: string; avatar: string | null }>
  lastReplyAt: string | null
}

export function toThreadInfo(row: Pick<Msg, 'reply_count' | 'last_reply_at' | 'reply_authors'>): ThreadInfo | undefined {
  const count = row.reply_count ?? 0
  if (count <= 0) return undefined
  return { count, authors: row.reply_authors ?? [], lastReplyAt: row.last_reply_at }
}
