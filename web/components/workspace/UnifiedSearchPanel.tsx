'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  Dialog,
  DialogContent,
  DialogHiddenTitle,
  DialogHiddenDescription,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { compactCount } from '@/lib/utils/format'
import { useMessageQuickSearch } from '@/lib/hooks/useMessageQuickSearch'
import { SEARCH_OPEN_EVENT } from '@/lib/utils/dispatch-search'

type Channel = { id: string; name: string; msg_count: number | null }
type PanelUser = { displayName: string; avatarUrl: string | null }

export function UnifiedSearchPanel({
  channels,
  users,
}: {
  channels: Channel[]
  users: PanelUser[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const toggle = useCallback(() => setOpen((v) => !v), [])

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault()
      toggle()
    },
    { enableOnFormTags: true, enableOnContentEditable: true },
  )

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(SEARCH_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(SEARCH_OPEN_EVENT, onOpen)
  }, [])

  const trimmed = query.trim()
  const lowerQ = trimmed.toLowerCase()

  const exactChannel = useMemo(
    () => (lowerQ ? channels.find((c) => c.name.toLowerCase() === lowerQ) : null),
    [channels, lowerQ],
  )

  const channelMatches = useMemo(() => {
    if (!lowerQ) return []
    return channels
      .filter((c) => c.name.toLowerCase() !== lowerQ && c.name.toLowerCase().includes(lowerQ))
      .slice(0, 5)
  }, [channels, lowerQ])

  const { results: messages, loading, error } = useMessageQuickSearch(query)

  const peopleMatches = useMemo(() => {
    if (!trimmed) return []
    return users
      .filter((u) => u.displayName.toLowerCase().includes(lowerQ))
      .slice(0, 3)
  }, [users, trimmed, lowerQ])

  const goFullSearch = useCallback(() => {
    if (!trimmed) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }, [router, trimmed])

  const goChannel = useCallback(
    (id: string) => {
      setOpen(false)
      router.push(`/c/${id}`)
    },
    [router],
  )

  const goAuthor = useCallback(
    (name: string) => {
      setOpen(false)
      router.push(`/search?author=${encodeURIComponent(name)}`)
    },
    [router],
  )

  const goMessage = useCallback(
    (channelId: string, threadTs: string | null) => {
      setOpen(false)
      if (!threadTs) {
        router.push(`/c/${channelId}`)
        return
      }
      router.push(`/c/${channelId}?t=${encodeURIComponent(threadTs)}`)
    },
    [router],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQuery('')
      }}
    >
      <DialogContent className="max-w-xl p-0">
        <DialogHiddenTitle>검색</DialogHiddenTitle>
        <DialogHiddenDescription>
          채널·사람·메시지를 한 번에 검색합니다
        </DialogHiddenDescription>
        <Command label="검색" shouldFilter={false}>
          <CommandInput
            placeholder="채널·사람·메시지를 검색…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!trimmed && (
              <div className="px-3 py-8 text-center text-xs text-text-muted">
                채널 이름·사람·메시지로 검색하세요
              </div>
            )}

            {(() => {
              const sections: ReactNode[] = []

              if (exactChannel) {
                sections.push(
                  <CommandGroup key="exact">
                    <CommandItem
                      value={`exact-${exactChannel.id}`}
                      onSelect={() => goChannel(exactChannel.id)}
                    >
                      <span className="text-text-muted">#</span>
                      <span>{exactChannel.name}</span>
                      <span className="ml-auto text-xs text-text-muted">Enter</span>
                    </CommandItem>
                  </CommandGroup>,
                )
              }

              if (trimmed) {
                sections.push(
                  <CommandGroup key="fullsearch">
                    <CommandItem
                      value={`fullsearch-${trimmed}`}
                      onSelect={goFullSearch}
                    >
                      <SearchIcon />
                      <span>
                        "{trimmed}"로 메시지 검색
                      </span>
                      <span className="ml-auto text-xs text-text-muted">↵</span>
                    </CommandItem>
                  </CommandGroup>,
                )
              }

              if (channelMatches.length > 0) {
                sections.push(
                  <CommandGroup key="channels" heading="채널">
                    {channelMatches.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={`ch-${c.id}`}
                        onSelect={() => goChannel(c.id)}
                      >
                        <span className="text-text-muted">#</span>
                        <span>{c.name}</span>
                        <span className="ml-auto text-xs text-text-muted tabular-nums">
                          {compactCount(c.msg_count ?? 0)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>,
                )
              }

              if (peopleMatches.length > 0) {
                sections.push(
                  <CommandGroup key="people" heading="사람">
                    {peopleMatches.map((u) => (
                      <CommandItem
                        key={u.displayName}
                        value={`au-${u.displayName}`}
                        onSelect={() => goAuthor(u.displayName)}
                      >
                        <span>{u.displayName}</span>
                        <span className="ml-auto text-xs text-text-muted">
                          이 사람의 메시지
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>,
                )
              }

              if (messages.length > 0) {
                sections.push(
                  <CommandGroup key="messages" heading="메시지">
                    {messages.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={`m-${m.id}`}
                        onSelect={() => {
                          if (m.channel_id) goMessage(m.channel_id, m.thread_ts)
                        }}
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[13px]">
                            {m.content_excerpt}
                          </span>
                          <span className="truncate text-[11px] text-text-muted">
                            #{m.channel_name ?? '?'} · {m.author ?? '—'}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>,
                )
              }

              return sections.flatMap((s, i) =>
                i === 0 ? [s] : [<CommandSeparator key={`sep-${i}`} />, s],
              )
            })()}

            {trimmed && loading && messages.length === 0 && !error && (
              <div className="px-3 py-2 text-xs text-text-muted">검색 중…</div>
            )}

            {trimmed &&
              !loading &&
              !exactChannel &&
              channelMatches.length === 0 &&
              peopleMatches.length === 0 &&
              messages.length === 0 &&
              !error && (
                <CommandEmpty>일치하는 결과가 없습니다.</CommandEmpty>
              )}

            {error && (
              <div role="alert" className="px-3 py-2 text-xs text-destructive">
                메시지 검색 일시 불가 — Enter로 전체 검색 시도
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
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
