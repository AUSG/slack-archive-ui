import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserMap, type UserMap } from '@/lib/data/users'
import { SearchBar } from '@/components/search-bar'
import { Message } from '@/components/message'
import { ThreadPanel } from '@/components/thread-panel'

type SearchRow = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
  channel_id: string | null
  parent_id: number | null
}

const PAGE_SIZE = 50

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ch?: string; t?: string; tc?: string }>
}) {
  const { q, ch, t: threadTs, tc: threadChannel } = await searchParams
  const supabase = await createClient()

  const [{ data: channels }, userMap] = await Promise.all([
    supabase.from('channel').select('id, name').order('name'),
    getUserMap(),
  ])

  const channelMap = new Map(
    (channels ?? []).map((c) => [c.id, c.name]),
  )

  let results: SearchRow[] = []
  let replyCounts: Record<number, number> = {}
  let errorMsg: string | null = null

  const trimmed = q?.trim() ?? ''
  if (trimmed) {
    const { data, error } = await supabase.rpc('search_messages', {
      q: trimmed,
      ch: ch || null,
      author_name: null,
      date_from: null,
      date_to: null,
      page_size: PAGE_SIZE,
      page_offset: 0,
    })
    if (error) {
      errorMsg = error.message
    } else {
      results = (data ?? []) as SearchRow[]

      // 결과 중 top-level 메시지의 답글 카운트 보강
      const topLevelIds = results
        .filter((r) => r.parent_id === null)
        .map((r) => r.id)
      if (topLevelIds.length > 0) {
        const { data: replies } = await supabase
          .from('document')
          .select('parent_id')
          .in('parent_id', topLevelIds)
        for (const r of replies ?? []) {
          if (r.parent_id != null) {
            replyCounts[r.parent_id] =
              (replyCounts[r.parent_id] ?? 0) + 1
          }
        }
      }
    }
  }

  // 현재 검색 컨텍스트를 유지한 URL prefix
  const baseQs = new URLSearchParams()
  if (trimmed) baseQs.set('q', trimmed)
  if (ch) baseQs.set('ch', ch)
  const baseHref = `/search?${baseQs.toString()}`

  const showThread = !!threadTs && !!threadChannel

  return (
    <div className="flex h-full overflow-hidden">
      <section className="flex h-full min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-3">
          <h2 className="text-base font-semibold text-zinc-900">검색</h2>
          <div className="mt-2">
            <SearchBar
              channels={channels ?? []}
              initialQuery={trimmed}
              initialChannel={ch ?? ''}
            />
          </div>
          {trimmed && !errorMsg && (
            <p className="mt-2 text-xs text-zinc-500">
              {`"${trimmed}"`} 결과 {results.length.toLocaleString()}건
              {results.length >= PAGE_SIZE && ' (상위 50개만 표시)'}
              {ch && channelMap.get(ch)
                ? ` · #${channelMap.get(ch)} 채널 내`
                : ''}
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
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              검색어를 입력하세요.
            </div>
          )}

          {trimmed && results.length === 0 && !errorMsg && (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              결과가 없습니다.
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-zinc-100 py-2">
              {results.map((r) => (
                <SearchResult
                  key={r.id}
                  row={r}
                  channelName={
                    r.channel_id
                      ? channelMap.get(r.channel_id) ?? null
                      : null
                  }
                  userMap={userMap}
                  replyCount={replyCounts[r.id] ?? 0}
                  baseQs={baseQs.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {showThread && (
        <ThreadPanel
          channelId={threadChannel}
          threadTs={threadTs}
          closeHref={baseHref}
        />
      )}
    </div>
  )
}

function SearchResult({
  row,
  channelName,
  userMap,
  replyCount,
  baseQs,
}: {
  row: SearchRow
  channelName: string | null
  userMap: UserMap
  replyCount: number
  baseQs: string
}) {
  const isTopLevel = row.parent_id === null
  // 스레드 열기: top-level + 답글 있음 → 검색 컨텍스트 보존한 URL
  const threadHref =
    isTopLevel && replyCount > 0 && row.channel_id && row.message_ts
      ? `/search?${baseQs}&t=${encodeURIComponent(row.message_ts)}&tc=${encodeURIComponent(row.channel_id)}`
      : undefined

  return (
    <div className="rounded-md hover:bg-zinc-50">
      <Link
        href={row.channel_id ? `/c/${row.channel_id}` : '#'}
        className="block px-4 pt-2 text-xs text-zinc-500 hover:underline"
      >
        {channelName ? `#${channelName}` : '#?'}
        {row.parent_id ? ' · 스레드 답글' : ''}
      </Link>
      <Message
        message={{
          id: row.id,
          author: row.author,
          author_image_url: row.author_image_url,
          timestamp: row.timestamp,
          content: row.content,
          message_ts: row.message_ts,
        }}
        replyCount={replyCount}
        threadHref={threadHref}
        userMap={userMap}
      />
    </div>
  )
}
