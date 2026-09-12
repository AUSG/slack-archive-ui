import { cache } from 'react'
import { getAllUsers } from '@/lib/api/archive'

export type UserInfo = {
  id: string
  displayName: string
  avatarUrl: string | null
}

/**
 * 워크스페이스 멤버 매핑. 백엔드 `GET /users` (전원) 한 번으로 만든다.
 * - byId: Slack user_id (U07XXX) → 프로필. 메시지 작성자·멘션·답글 아바타 렌더에 쓴다.
 * - byName: 표시 이름 → 프로필. 검색의 "작성자 이름" 필터와 ⌘K 사람 검색만 쓴다 (동명이인은 첫 번째).
 *
 * 예전에는 Supabase `slack_user` 를 직접 읽고 메시지의 이름 문자열로 조인했다. 이제 메시지에는 id 만 있다 (D7).
 */
export type UserMap = {
  byId: Record<string, UserInfo>
  byName: Record<string, UserInfo>
}

export const getUserMap = cache(async (): Promise<UserMap> => {
  const users = await getAllUsers()
  const byId: Record<string, UserInfo> = {}
  const byName: Record<string, UserInfo> = {}
  for (const u of users) {
    const displayName = u.profile.display_name || u.profile.real_name || u.id
    const info: UserInfo = { id: u.id, displayName, avatarUrl: u.profile.image_72 ?? null }
    byId[u.id] = info
    for (const name of [u.profile.display_name, u.profile.real_name]) {
      if (name && !byName[name]) byName[name] = info
    }
  }
  return { byId, byName }
})

/** 이름 → user id. 검색의 작성자 필터용. 모르면 null (결과 없음으로 처리). */
export function resolveUserIdByName(userMap: UserMap, name: string): string | null {
  return userMap.byName[name]?.id ?? null
}
