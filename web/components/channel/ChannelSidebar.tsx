'use client'

import { usePathname } from 'next/navigation'
import { ChannelSectionHeader } from './ChannelSectionHeader'
import { ChannelListItem } from './ChannelListItem'
import { GlobalSearchInput } from '@/components/workspace/GlobalSearchInput'
import { useState } from 'react'

type Channel = { id: string; name: string; msg_count: number | null }

export function ChannelSidebar({ channels }: { channels: Channel[] }) {
  const pathname = usePathname()
  const [openChannels, setOpenChannels] = useState(true)

  return (
    <nav
      aria-label="채널 목록"
      className="flex h-full w-full flex-col overflow-hidden bg-sidebar-base text-sidebar-fg"
    >
      <div className="shrink-0 border-b border-sidebar-border-soft px-4 py-3">
        <h1 className="text-[15px] font-extrabold">AUSG Slack 아카이브</h1>
        <p className="mt-0.5 text-[11px] text-sidebar-fg-muted">au-sg.slack.com · 읽기 전용</p>
      </div>

      <div className="px-2 pt-2 pb-1">
        <GlobalSearchInput size="sidebar" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <ChannelSectionHeader
          label="Channels"
          open={openChannels}
          onToggle={() => setOpenChannels((v) => !v)}
          count={channels.length}
        />
        {openChannels && (
          <ul className="space-y-px">
            {channels.map((ch) => (
              <li key={ch.id}>
                <ChannelListItem
                  id={ch.id}
                  name={ch.name}
                  count={ch.msg_count}
                  active={pathname === `/c/${ch.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}
