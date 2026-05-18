import { WorkspaceRail } from '@/components/workspace/WorkspaceRail'
import { ChannelSidebar } from '@/components/channel/ChannelSidebar'
import { QuickSwitcher } from '@/components/workspace/QuickSwitcher'
import { MobileNav } from './MobileNav'

type Channel = { id: string; name: string; msg_count: number | null }

export function AppShell({
  channels,
  displayName,
  avatarUrl,
  email,
  children,
}: {
  channels: Channel[]
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
      <QuickSwitcher channels={channels} />
    </>
  )
}
