import { dayLabel } from '@/lib/utils/format'

export function DayDivider({ iso }: { iso: string }) {
  return (
    <div className="relative my-2 h-7 px-4" aria-hidden>
      <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-border-soft" />
      <div className="invisible flex h-full items-center justify-center">
        <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-[12px] font-semibold">
          {dayLabel(iso)}
        </span>
      </div>
    </div>
  )
}

export function StickyDayChip({ iso }: { iso: string }) {
  return (
    <div className="pointer-events-none sticky top-2 z-10 -mt-9 mb-2 flex justify-center">
      <span className="pointer-events-auto rounded-full border border-border-soft bg-surface px-3 py-1 text-[12px] font-semibold text-text-strong shadow-sm">
        {dayLabel(iso)}
      </span>
    </div>
  )
}
