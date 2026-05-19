'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Channel = { id: string; name: string }
type DateRangePreset = '' | '1d' | '7d' | '30d' | 'custom'

const DATE_OPTIONS: Array<{ value: DateRangePreset; label: string }> = [
  { value: '', label: '모든 기간' },
  { value: '1d', label: '오늘' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: 'custom', label: '직접 입력…' },
]

function presetToIso(preset: DateRangePreset): { from: string; to: string } | null {
  if (!preset || preset === 'custom') return null
  const now = new Date()
  const to = now.toISOString()
  const from = new Date(now)
  if (preset === '1d') from.setHours(0, 0, 0, 0)
  if (preset === '7d') from.setDate(now.getDate() - 7)
  if (preset === '30d') from.setDate(now.getDate() - 30)
  return { from: from.toISOString(), to }
}

export function SearchFilters({
  channels,
  initial,
}: {
  channels: Channel[]
  initial: {
    q: string
    channelId: string
    author: string
    from: string
    to: string
    hasThread: boolean
  }
}) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q)
  const [channelId, setChannelId] = useState(initial.channelId)
  const [author, setAuthor] = useState(initial.author)
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [hasThread, setHasThread] = useState(initial.hasThread)
  const [datePreset, setDatePresetState] = useState<DateRangePreset>(
    initial.from || initial.to ? 'custom' : '',
  )

  const setDatePreset = (next: DateRangePreset) => {
    setDatePresetState(next)
    if (next === '') {
      setFrom('')
      setTo('')
      return
    }
    if (next !== 'custom') {
      const r = presetToIso(next)
      if (r) {
        setFrom(r.from)
        setTo(r.to)
      }
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (channelId) p.set('ch', channelId)
    if (author.trim()) p.set('author', author.trim())
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    if (hasThread) p.set('hasThread', '1')
    router.push(`/search?${p.toString()}`)
  }

  const channelLabel = channelId
    ? `#${channels.find((c) => c.id === channelId)?.name ?? ''}`
    : '모든 채널'
  const authorLabel = author ? `From: ${author}` : 'From: 모두'
  const dateLabel =
    datePreset === 'custom' && (from || to)
      ? `${from?.slice(0, 10) || '~'} ~ ${to?.slice(0, 10) || '~'}`
      : DATE_OPTIONS.find((o) => o.value === datePreset)?.label ?? '모든 기간'

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="채널 또는 메시지를 검색…"
          className="min-w-[280px] flex-1 rounded-md border border-border-soft bg-surface px-4 py-2.5 text-[15px] text-text-strong placeholder:text-text-muted focus:border-text-link focus:outline-none"
          autoFocus
        />
        <Button type="submit" className="h-auto px-5 text-[15px]">
          검색
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChannelChip
          label={channelLabel}
          active={!!channelId}
          channels={channels}
          value={channelId}
          onChange={setChannelId}
        />
        <AuthorChip
          label={authorLabel}
          active={!!author}
          value={author}
          onChange={setAuthor}
        />
        <DateChip
          label={dateLabel}
          active={!!datePreset}
          preset={datePreset}
          from={from}
          to={to}
          onPreset={setDatePreset}
          onFrom={setFrom}
          onTo={setTo}
        />
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setHasThread((v) => !v)}
          aria-pressed={hasThread}
          className={cn(
            'rounded-full',
            hasThread &&
              'border-text-link bg-mention-bg text-mention-fg hover:bg-mention-bg',
          )}
        >
          스레드 있는 것만
        </Button>
      </div>
    </form>
  )
}

function ChipButton({
  children,
  active,
  ...rest
}: React.ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-text-link bg-mention-bg text-mention-fg'
          : 'border-border-soft bg-surface text-text-muted hover:text-text-strong',
        rest.className,
      )}
    >
      {children}
    </button>
  )
}

function ChannelChip({
  label,
  active,
  channels,
  value,
  onChange,
}: {
  label: string
  active: boolean
  channels: Channel[]
  value: string
  onChange: (v: string) => void
}) {
  const [filter, setFilter] = useState('')
  const visible = channels.filter((c) =>
    !filter ? true : c.name.toLowerCase().includes(filter.toLowerCase()),
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChipButton active={active}>
          <span>In: {label}</span>
          <Caret />
        </ChipButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto">
        <div className="p-1">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="채널 찾기"
            className="w-full rounded border border-border-soft bg-surface px-2 py-1 text-xs"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onChange('')}
          className="justify-between"
        >
          <span>모든 채널</span>
          {!value && <Check />}
        </DropdownMenuItem>
        {visible.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onSelect={() => onChange(c.id)}
            className="justify-between"
          >
            <span>#{c.name}</span>
            {value === c.id && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AuthorChip({
  label,
  active,
  value,
  onChange,
}: {
  label: string
  active: boolean
  value: string
  onChange: (v: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChipButton active={active}>
          <span>{label}</span>
          <Caret />
        </ChipButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>작성자 이름</DropdownMenuLabel>
        <div className="p-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="예: 도정민"
            className="w-full rounded border border-border-soft bg-surface px-2 py-1 text-xs"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onChange('')}>
          모두 지우기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DateChip({
  label,
  active,
  preset,
  from,
  to,
  onPreset,
  onFrom,
  onTo,
}: {
  label: string
  active: boolean
  preset: DateRangePreset
  from: string
  to: string
  onPreset: (p: DateRangePreset) => void
  onFrom: (v: string) => void
  onTo: (v: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChipButton active={active}>
          <span>Date: {label}</span>
          <Caret />
        </ChipButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        {DATE_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onSelect={() => onPreset(o.value)}
            className="justify-between"
          >
            <span>{o.label}</span>
            {preset === o.value && <Check />}
          </DropdownMenuItem>
        ))}
        {preset === 'custom' && (
          <>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <label className="block text-xs text-text-muted">
                From
                <input
                  type="date"
                  value={from.slice(0, 10)}
                  onChange={(e) =>
                    onFrom(
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : '',
                    )
                  }
                  className="mt-1 block w-full rounded border border-border-soft bg-surface px-2 py-1 text-xs"
                />
              </label>
              <label className="block text-xs text-text-muted">
                To
                <input
                  type="date"
                  value={to.slice(0, 10)}
                  onChange={(e) =>
                    onTo(
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : '',
                    )
                  }
                  className="mt-1 block w-full rounded border border-border-soft bg-surface px-2 py-1 text-xs"
                />
              </label>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Caret() {
  return <span aria-hidden>▾</span>
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
