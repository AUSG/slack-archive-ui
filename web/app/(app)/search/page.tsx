import Link from 'next/link'
import { getChannels, searchMessages } from '@/lib/api/archive'
import { ApiError } from '@/lib/api/client'
import { toChannel, toMsg } from '@/lib/data/adapt'
import { getUserMap, resolveUserIdByName } from '@/lib/data/users'
import type { Msg } from '@/lib/data/types'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResultGroup } from '@/components/search/SearchResultGroup'
import { ThreadPanel } from '@/components/thread/ThreadPanel'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'

type SearchRow = Msg

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

  // 채널 목록은 권한이 걸린 것만 온다. 검색도 백엔드가 같은 집합으로 거르므로 여기서 다시 거를 필요가 없다
  const [apiChannels, userMap] = await Promise.all([getChannels(), getUserMap()])
  const channels = apiChannels.map(toChannel)
  const channelMap = new Map(channels.map((c) => [c.id, c.name]))

  const trimmed = sp.q?.trim() ?? ''
  let results: SearchRow[] = []
  let errorMsg: string | null = null

  if (trimmed) {
    // 작성자 필터는 UI 가 이름을 받고 백엔드는 id 를 받는다. 이름을 모르면 결과 없음 (검색을 풀어 버리지 않는다)
    const authorName = sp.author?.trim() || ''
    const userId = authorName ? resolveUserIdByName(userMap, authorName) : null
    if (authorName && !userId) {
      results = []
    } else {
      try {
        const res = await searchMessages({
          q: trimmed,
          channel: sp.ch || undefined,
          user: userId ?? undefined,
          from: sp.from || undefined,
          to: sp.to || undefined,
          limit: PAGE_SIZE,
          offset: 0,
        })
        results = res.messages.map((m) => toMsg(m, userMap))
        if (sp.hasThread === '1') {
          results = results.filter((r) => !r.is_reply && (r.reply_count ?? 0) > 0)
        }
      } catch (e) {
        errorMsg = e instanceof ApiError ? `검색 실패 (${e.status})` : '검색 실패'
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
        <header className="shrink-0 border-b border-border-soft bg-surface px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="-ml-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-strong md:hidden"
              aria-label="홈으로"
            >
              <BackIcon />
            </Link>
            <h2 className="text-lg text-text-muted">
              {trimmed ? (
                <>검색: <span className="font-bold text-text-strong">{trimmed}</span></>
              ) : (
                <span className="font-bold text-text-strong">검색</span>
              )}
            </h2>
          </div>
          <div className="mt-3">
            <SearchFilters
              channels={channels}
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
            <p className="mt-3 text-xs text-text-muted">
              결과 {results.length.toLocaleString()}건
              {results.length >= PAGE_SIZE && ' (상위 50개)'}
            </p>
          )}
          {errorMsg && (
            <p className="mt-3 text-xs text-destructive">
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
