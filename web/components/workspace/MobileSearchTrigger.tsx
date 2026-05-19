'use client'

import { dispatchSearchOpen } from '@/lib/utils/dispatch-search'

export function MobileSearchTrigger() {
  return (
    <button
      type="button"
      onClick={dispatchSearchOpen}
      aria-label="검색 열기"
      className="-mr-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-strong md:hidden"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </button>
  )
}
