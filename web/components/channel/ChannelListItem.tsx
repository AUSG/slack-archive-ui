'use client'

import Link, { useLinkStatus } from 'next/link'
import { compactCount } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

export function ChannelListItem({
  id,
  name,
  count,
  active,
}: {
  id: string
  name: string
  count: number | null
  active: boolean
}) {
  return (
    <Link
      href={`/c/${id}`}
      className={cn(
        'group relative flex items-center gap-2 rounded-sm px-3 py-1 text-[14px] leading-5 transition-colors',
        active
          ? 'bg-sidebar-active-bg text-white'
          : 'text-sidebar-fg hover:bg-sidebar-hover',
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[3px] rounded-r bg-[color:var(--sidebar-active-bar)]"
        />
      )}
      <ItemInner name={name} active={active} count={count} />
    </Link>
  )
}

function ItemInner({
  name,
  active,
  count,
}: {
  name: string
  active: boolean
  count: number | null
}) {
  const { pending } = useLinkStatus()
  return (
    <>
      <span
        className={cn(
          'shrink-0',
          active ? 'text-white/85' : 'text-sidebar-fg-muted group-hover:text-sidebar-fg',
        )}
      >
        {pending ? <Spin /> : '#'}
      </span>
      <span className="truncate">{name}</span>
      <span
        className={cn(
          'ml-auto shrink-0 text-[11px] tabular-nums',
          active ? 'text-white/70' : 'text-sidebar-fg-muted',
        )}
      >
        {compactCount(count ?? 0)}
      </span>
    </>
  )
}

function Spin() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeDasharray="40 60" opacity="0.9" />
    </svg>
  )
}
