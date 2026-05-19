'use client'

import * as React from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'
import { dispatchSearchOpen } from '@/lib/utils/dispatch-search'

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

export function GlobalSearchInput({
  size = 'sidebar',
  className,
}: {
  size?: 'sidebar' | 'hero'
  className?: string
}) {
  const isMac = React.useSyncExternalStore(subscribe, getIsMac, getServerIsMac)

  const onClick = () => dispatchSearchOpen()
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      dispatchSearchOpen()
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label="검색 열기"
      className={cn(
        'group relative flex w-full items-center gap-2 rounded-md border text-left transition-colors',
        size === 'sidebar'
          ? 'border-sidebar-border-soft bg-sidebar-hover px-2 py-1.5 text-[13px] text-sidebar-fg-muted hover:bg-sidebar-active-bg/40'
          : 'border-border-soft bg-surface px-4 py-3 text-[15px] text-text-muted shadow-sm hover:bg-surface-hover',
        className,
      )}
    >
      <SearchIcon className={size === 'hero' ? 'h-5 w-5' : 'h-4 w-4'} />
      <span className="flex-1 truncate">
        {size === 'hero' ? '채널·사람·메시지를 검색…' : '검색…'}
      </span>
      <KbdGroup>
        <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
