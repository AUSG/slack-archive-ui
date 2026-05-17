/**
 * 스레드 뱃지에 필요한 집계 정보.
 * - count: 답글 수
 * - authors: 답글한 사람 (중복 제거, 최대 3명)
 * - lastReplyAt: 가장 늦은 답글의 timestamp (ISO string)
 */
export type ThreadInfo = {
  count: number
  authors: Array<{ name: string; avatar: string | null }>
  lastReplyAt: string | null
}

export type ReplyRow = {
  parent_id: number | null
  author: string | null
  author_image_url: string | null
  timestamp: string | null
}

/** 답글 row 들을 부모 메시지 id 기준으로 묶어 ThreadInfo 맵 생성. */
export function buildThreadInfoMap(
  replies: ReplyRow[],
): Record<number, ThreadInfo> {
  const map: Record<number, ThreadInfo> = {}
  for (const r of replies) {
    if (r.parent_id == null) continue
    const info: ThreadInfo = map[r.parent_id] ?? {
      count: 0,
      authors: [],
      lastReplyAt: null,
    }
    info.count++
    if (
      r.author &&
      info.authors.length < 3 &&
      !info.authors.some((a) => a.name === r.author)
    ) {
      info.authors.push({
        name: r.author,
        avatar: r.author_image_url,
      })
    }
    if (
      r.timestamp &&
      (info.lastReplyAt === null || r.timestamp > info.lastReplyAt)
    ) {
      info.lastReplyAt = r.timestamp
    }
    map[r.parent_id] = info
  }
  return map
}
