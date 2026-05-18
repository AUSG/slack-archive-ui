'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

function getHint(): '⌘K' | 'Ctrl+K' {
  if (typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')) {
    return '⌘K'
  }
  return 'Ctrl+K'
}

function getServerHint(): 'Ctrl+K' {
  return 'Ctrl+K'
}

function subscribe() {
  return () => {}
}

export function QuickSwitcherTrigger() {
  const hint = React.useSyncExternalStore(subscribe, getHint, getServerHint)

  const dispatch = () => {
    const ev = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(ev)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={dispatch}
      aria-label={`채널 빠른 이동 (${hint})`}
      title={`채널 빠른 이동 (${hint})`}
      className="text-sidebar-fg-muted hover:bg-sidebar-hover hover:text-sidebar-fg"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </Button>
  )
}
