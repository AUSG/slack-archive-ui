'use client'

import * as React from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

function getIsMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toUpperCase().includes('MAC')
}

function getServerIsMac(): false {
  return false
}

function subscribe() {
  return () => {}
}

export function ChannelFilterInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const isMac = React.useSyncExternalStore(subscribe, getIsMac, getServerIsMac)

  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sidebar-fg-muted">
          <Search />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="채널 찾기"
          aria-label="채널 이름으로 필터"
          className="block w-full rounded-md border border-sidebar-border-soft bg-sidebar-hover py-1.5 pl-7 pr-16 text-[13px] text-sidebar-fg placeholder:text-sidebar-fg-muted focus:border-sidebar-fg-muted focus:outline-none"
        />
        <KbdGroup className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </div>
  )
}

function Search() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
