import { WorkspaceRail } from '@/components/workspace/WorkspaceRail'
import { ChannelSidebar } from '@/components/channel/ChannelSidebar'
import { UnifiedSearchPanel } from '@/components/workspace/UnifiedSearchPanel'
import { MobileNav } from './MobileNav'

type Channel = { id: string; name: string; msg_count: number | null }
type PanelUser = { displayName: string; avatarUrl: string | null }

export function AppShell({
  channels,
  users,
  displayName,
  avatarUrl,
  email,
  children,
}: {
  channels: Channel[]
  users: PanelUser[]
  displayName: string
  avatarUrl: string | null
  email: string | null
  children: React.ReactNode
}) {
  return (
    <>
      <MobileNav
        rail={
          <WorkspaceRail
            displayName={displayName}
            avatarUrl={avatarUrl}
            email={email}
          />
        }
        sidebar={<ChannelSidebar channels={channels} />}
        main={children}
      />
      <UnifiedSearchPanel channels={channels} users={users} />
    </>
  )
}
