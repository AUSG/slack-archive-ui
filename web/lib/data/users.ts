import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type UserMap = Record<string, string>

/**
 * 워크스페이스의 user_id → display_name 매핑.
 * React `cache()` 로 같은 요청 내 중복 호출은 한 번만 실행.
 */
export const getUserMap = cache(async (): Promise<UserMap> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('slack_user')
    .select('id, display_name')

  const map: UserMap = {}
  for (const u of data ?? []) {
    if (u.id && u.display_name) {
      map[u.id] = u.display_name
    }
  }
  return map
})
