import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserMap } from '@/lib/data/users'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResultGroup } from '@/components/search/SearchResultGroup'
import { ThreadPanel } from '@/components/thread/ThreadPanel'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'

type SearchRow = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
  channel_id: string | null
  parent_id: number | null
  reply_count: number | null
  last_reply_at: string | null
  reply_authors: Array<{ name: string; avatar: string | null }> | null
}

const PAGE_SIZE = 50

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    ch?: string
    author?: string
    from?: string
    to?: string
    hasThread?: string
    t?: string
    tc?: string
  }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const [{ data: channels }, userMap] = await Promise.all([
    supabase
      .from('channel')
      .select('id, name')
      .not('name', 'ilike', HIDDEN_NAME_LIKE)
      .not('name', 'imatch', HIDDEN_NAME_REGEX)
      .order('name'),
    getUserMap(),
  ])

  const channelMap = new Map((channels ?? []).map((c) => [c.id, c.name]))

  const trimmed = sp.q?.trim() ?? ''
  let results: SearchRow[] = []
  let errorMsg: string | null = null

  if (trimmed) {
    const { data, error } = await supabase.rpc('search_messages', {
      q: trimmed,
      ch: sp.ch || null,
      author_name: sp.author?.trim() || null,
      date_from: sp.from || null,
      date_to: sp.to || null,
      page_size: PAGE_SIZE,
      page_offset: 0,
    })
    if (error) {
      errorMsg = error.message
    } else {
      results = ((data ?? []) as SearchRow[]).filter(
        (r) => r.channel_id !== null && channelMap.has(r.channel_id),
      )
      if (sp.hasThread === '1') {
        results = results.filter(
          (r) => r.parent_id === null && (r.reply_count ?? 0) > 0,
        )
      }
    }
  }

  const groups = new Map<string, SearchRow[]>()
  for (const r of results) {
    if (!r.channel_id) continue
    const arr = groups.get(r.channel_id) ?? []
    arr.push(r)
    groups.set(r.channel_id, arr)
  }

  const baseQs = new URLSearchParams()
  if (trimmed) baseQs.set('q', trimmed)
  if (sp.ch) baseQs.set('ch', sp.ch)
  if (sp.author) baseQs.set('author', sp.author)
  if (sp.from) baseQs.set('from', sp.from)
  if (sp.to) baseQs.set('to', sp.to)
  if (sp.hasThread) baseQs.set('hasThread', sp.hasThread)
  const baseHref = `/search?${baseQs.toString()}`

  const showThread = !!sp.t && !!sp.tc

  const main = (
    <section className="flex h-full min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-border-soft bg-surface px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="-ml-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-strong md:hidden"
              aria-label="홈으로"
            >
              <BackIcon />
            </Link>
            <h2 className="text-base font-bold text-text-strong">검색</h2>
          </div>
          <div className="mt-2">
            <SearchFilters
              channels={channels ?? []}
              initial={{
                q: trimmed,
                channelId: sp.ch ?? '',
                author: sp.author ?? '',
                from: sp.from ?? '',
                to: sp.to ?? '',
                hasThread: sp.hasThread === '1',
              }}
            />
          </div>
          {trimmed && !errorMsg && (
            <p className="mt-2 text-xs text-text-muted">
              {`"${trimmed}"`} 결과 {results.length.toLocaleString()}건
              {results.length >= PAGE_SIZE && ' (상위 50개)'}
            </p>
          )}
          {errorMsg && (
            <p className="mt-2 text-xs text-red-600">
              검색 오류: {errorMsg}
            </p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {!trimmed && (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              검색어를 입력하세요.
            </div>
          )}
          {trimmed && results.length === 0 && !errorMsg && (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              결과가 없습니다.
            </div>
          )}
          {results.length > 0 && (
            <div>
              {Array.from(groups.entries()).map(([cid, rows]) => (
                <SearchResultGroup
                  key={cid}
                  channelId={cid}
                  channelName={channelMap.get(cid) ?? '?'}
                  rows={rows}
                  userMap={userMap}
                  baseQs={baseQs.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </section>
  )

  if (!showThread || !sp.t || !sp.tc) {
    return <div className="flex h-full overflow-hidden">{main}</div>
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex h-full w-full md:hidden">
        <ThreadPanel channelId={sp.tc} threadTs={sp.t} closeHref={baseHref} />
      </div>
      <div className="hidden h-full w-full md:flex">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={65} minSize={40}>
            {main}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <ThreadPanel
              channelId={sp.tc}
              threadTs={sp.t}
              closeHref={baseHref}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}
