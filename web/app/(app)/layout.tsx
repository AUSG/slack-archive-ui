import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/chrome/AppShell'
import { getChannels } from '@/lib/api/archive'
import { ApiError } from '@/lib/api/client'
import { toChannel } from '@/lib/data/adapt'
import { getUserMap } from '@/lib/data/users'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata ?? {}
  const displayName = meta.name ?? meta.full_name ?? user.email ?? '—'
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null
  const email = user.email ?? null

  // 채널 목록은 백엔드가 권한(public 전부 + 내가 멤버인 private)으로 걸러 준다. 이름 규칙 필터는 없어졌다.
  let channels
  let userMap
  try {
    ;[channels, userMap] = await Promise.all([getChannels(), getUserMap()])
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) {
      // 로그인은 됐지만 워크스페이스 멤버 목록에 없다 (탈퇴, 또는 오늘 가입해 아직 동기화 전)
      await supabase.auth.signOut()
      redirect('/login?error=not_member')
    }
    throw e
  }

  const users = Object.values(userMap.byId).map((u) => ({
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
  }))

  return (
    <AppShell
      channels={channels.map(toChannel)}
      users={users}
      displayName={displayName}
      avatarUrl={avatarUrl}
      email={email}
    >
      {children}
    </AppShell>
  )
}
