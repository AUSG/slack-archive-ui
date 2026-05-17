import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

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
    .order('name')

  const meta = user.user_metadata ?? {}
  const displayName = meta.name ?? meta.full_name ?? user.email ?? '—'
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        channels={channels ?? []}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {children}
      </main>
    </div>
  )
}
