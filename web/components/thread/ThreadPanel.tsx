import { createClient } from '@/lib/supabase/server'
import { getUserMap } from '@/lib/data/users'
import { MessageRow } from '@/components/message/MessageRow'
import { within } from '@/lib/utils/format'
import { ThreadHeader } from './ThreadHeader'

const COMPACT_WINDOW_MS = 5 * 60 * 1000

export async function ThreadPanel({
  channelId,
  threadTs,
  closeHref,
}: {
  channelId: string
  threadTs: string
  closeHref?: string
}) {
  const supabase = await createClient()
  const userMap = await getUserMap()

  const [{ data: channel }, { data: root }] = await Promise.all([
    supabase
      .from('channel')
      .select('name')
      .eq('id', channelId)
      .maybeSingle(),
    supabase
      .from('document')
      .select('id, author, author_image_url, timestamp, content, message_ts')
      .eq('channel_id', channelId)
      .eq('message_ts', threadTs)
      .is('parent_id', null)
      .maybeSingle(),
  ])

  const resolvedClose = closeHref ?? `/c/${channelId}`

  if (!root) {
    return (
      <Shell
        closeHref={resolvedClose}
        channelName={channel?.name ?? null}
        replyCount={0}
      >
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-sm text-text-muted">
          스레드를 찾을 수 없습니다.
        </div>
      </Shell>
    )
  }

  const { data: replies } = await supabase
    .from('document')
    .select('id, author, author_image_url, timestamp, content, message_ts')
    .eq('parent_id', root.id)
    .order('timestamp', { ascending: true })

  const list = replies ?? []

  return (
    <Shell
      closeHref={resolvedClose}
      channelName={channel?.name ?? null}
      replyCount={list.length}
    >
      <div className="flex-1 overflow-y-auto">
        <MessageRow
          message={root}
          compact={false}
          userMap={userMap}
          showActions={false}
        />
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-text-muted">
          <span>답글 {list.length}개</span>
          <div className="h-px flex-1 bg-border-soft" />
        </div>
        <div className="pb-4">
          {list.map((r, i) => {
            const prev = list[i - 1]
            const compact =
              !!prev &&
              !!prev.timestamp &&
              !!r.timestamp &&
              prev.author === r.author &&
              within(prev.timestamp, r.timestamp, COMPACT_WINDOW_MS)
            return (
              <MessageRow
                key={r.id}
                message={r}
                compact={compact}
                userMap={userMap}
                showActions={false}
              />
            )
          })}
        </div>
      </div>
    </Shell>
  )
}

function Shell({
  closeHref,
  channelName,
  replyCount,
  children,
}: {
  closeHref: string
  channelName: string | null
  replyCount: number
  children: React.ReactNode
}) {
  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-border-soft bg-surface">
      <ThreadHeader
        channelName={channelName}
        replyCount={replyCount}
        closeHref={closeHref}
      />
      {children}
    </aside>
  )
}
