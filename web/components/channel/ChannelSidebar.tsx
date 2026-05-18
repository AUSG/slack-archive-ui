'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChannelSectionHeader } from './ChannelSectionHeader'
import { ChannelListItem } from './ChannelListItem'
import { ChannelFilterInput } from './ChannelFilterInput'
import { cn } from '@/lib/utils'

type Channel = { id: string; name: string; msg_count: number | null }

export function ChannelSidebar({ channels }: { channels: Channel[] }) {
  const pathname = usePathname()
  const [filter, setFilter] = useState('')
  const [openChannels, setOpenChannels] = useState(true)

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return channels
    return channels.filter((c) => c.name.toLowerCase().includes(q))
  }, [channels, filter])

  return (
    <nav
      aria-label="채널 목록"
      className="flex h-full w-full flex-col overflow-hidden bg-sidebar-base text-sidebar-fg"
    >
      <div className="shrink-0 border-b border-sidebar-border-soft px-4 py-3">
        <h1 className="text-[15px] font-extrabold">AUSG Slack 아카이브</h1>
        <p className="mt-0.5 text-[11px] text-sidebar-fg-muted">au-sg.slack.com · 읽기 전용</p>
      </div>

      <ChannelFilterInput value={filter} onChange={setFilter} />

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <Link
          href="/search"
          className={cn(
            'mb-1 flex items-center gap-2 rounded-sm px-3 py-1 text-[14px] transition-colors',
            pathname.startsWith('/search')
              ? 'bg-sidebar-active-bg text-white'
              : 'text-sidebar-fg hover:bg-sidebar-hover',
          )}
        >
          <SearchIcon />
          <span>검색</span>
        </Link>

        <ChannelSectionHeader
          label="Channels"
          open={openChannels}
          onToggle={() => setOpenChannels((v) => !v)}
          count={filtered.length}
        />
        {openChannels && (
          <ul className="space-y-px">
            {filtered.map((ch) => (
              <li key={ch.id}>
                <ChannelListItem
                  id={ch.id}
                  name={ch.name}
                  count={ch.msg_count}
                  active={pathname === `/c/${ch.id}`}
                />
              </li>
            ))}
            {filter && filtered.length === 0 && (
              <li className="px-3 py-2 text-[12px] text-sidebar-fg-muted">
                일치하는 채널이 없습니다
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
