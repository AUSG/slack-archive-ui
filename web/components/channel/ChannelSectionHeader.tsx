'use client'

import { cn } from '@/lib/utils'

export function ChannelSectionHeader({
  label,
  open,
  onToggle,
  count,
}: {
  label: string
  open: boolean
  onToggle: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sidebar-fg-muted transition-colors hover:text-sidebar-fg"
      aria-expanded={open}
    >
      <span
        className={cn(
          'inline-block transition-transform',
          open ? 'rotate-90' : 'rotate-0',
        )}
        aria-hidden
      >
        ▸
      </span>
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="ml-auto text-[10px] font-medium tabular-nums text-sidebar-fg-muted">
          {count}
        </span>
      )}
    </button>
  )
}
