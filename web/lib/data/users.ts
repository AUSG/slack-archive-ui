import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type UserInfo = {
  id: string
  displayName: string
  avatarUrl: string | null
}

/**
 * 워크스페이스 멤버 매핑.
 * - byId: Slack user_id (U07XXX) → 최신 프로필
 * - byName: display_name → 최신 프로필 (동명이인은 첫 번째만)
 *
 * vecpot 의 /api/v1/slack-users/refresh 가 slack_user 테이블을 갱신하면
 * 다음 페이지 로드부터 자동으로 최신 avatar/displayName 이 반영됨.
 */
export type UserMap = {
  byId: Record<string, UserInfo>
  byName: Record<string, UserInfo>
}

export const getUserMap = cache(async (): Promise<UserMap> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('slack_user')
    .select('id, display_name, avatar_url')

  const byId: Record<string, UserInfo> = {}
  const byName: Record<string, UserInfo> = {}

  for (const u of data ?? []) {
    if (!u.id || !u.display_name) continue
    const info: UserInfo = {
      id: u.id,
      displayName: u.display_name,
      avatarUrl: u.avatar_url ?? null,
    }
    byId[u.id] = info
    if (!byName[u.display_name]) {
      byName[u.display_name] = info
    }
  }

  return { byId, byName }
})
