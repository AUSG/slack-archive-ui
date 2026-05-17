/**
 * 스레드 뱃지에 필요한 집계 정보.
 * - count: 답글 수
 * - authors: 답글한 사람 (중복 제거, 최대 3명)
 * - lastReplyAt: 가장 늦은 답글의 timestamp (ISO string)
 *
 * 값은 document.reply_count / last_reply_at / reply_authors (denorm) 에서 옴.
 * 유지는 DB trigger document_reply_aggregates 가 담당.
 */
export type ThreadInfo = {
  count: number
  authors: Array<{ name: string; avatar: string | null }>
  lastReplyAt: string | null
}

type ReplyAggregateRow = {
  reply_count: number | null
  last_reply_at: string | null
  reply_authors: Array<{ name: string; avatar: string | null }> | null
}

/** document row 의 denorm 컬럼을 ThreadInfo 로 변환. 답글 0 이면 undefined. */
export function toThreadInfo(row: ReplyAggregateRow): ThreadInfo | undefined {
  const count = row.reply_count ?? 0
  if (count <= 0) return undefined
  return {
    count,
    authors: row.reply_authors ?? [],
    lastReplyAt: row.last_reply_at,
  }
}
