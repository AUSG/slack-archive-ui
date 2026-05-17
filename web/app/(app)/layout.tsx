import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileNavWrapper } from '@/components/mobile-nav-wrapper'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'

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

  const { data: channels } = await supabase
    .from('channel')
    .select('id, name, msg_count')
    .not('name', 'ilike', HIDDEN_NAME_LIKE)
    .not('name', 'imatch', HIDDEN_NAME_REGEX)
    .order('name')

  const meta = user.user_metadata ?? {}
  const displayName = meta.name ?? meta.full_name ?? user.email ?? '—'
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null

  return (
    <MobileNavWrapper
      sidebar={
        <Sidebar
          channels={channels ?? []}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
      }
      main={children}
    />
  )
}
