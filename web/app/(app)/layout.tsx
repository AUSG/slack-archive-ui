import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/chrome/AppShell'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'
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

  const [{ data: channels }, userMap] = await Promise.all([
    supabase
      .from('channel')
      .select('id, name, msg_count')
      .not('name', 'ilike', HIDDEN_NAME_LIKE)
      .not('name', 'imatch', HIDDEN_NAME_REGEX)
      .order('name'),
    getUserMap(),
  ])

  const users = Object.values(userMap.byId).map((u) => ({
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
  }))

  const meta = user.user_metadata ?? {}
  const displayName = meta.name ?? meta.full_name ?? user.email ?? '—'
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null
  const email = user.email ?? null

  return (
    <AppShell
      channels={channels ?? []}
      users={users}
      displayName={displayName}
      avatarUrl={avatarUrl}
      email={email}
    >
      {children}
    </AppShell>
  )
}
