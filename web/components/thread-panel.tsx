import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Message } from '@/components/message'
import { getUserMap } from '@/lib/data/users'

export async function ThreadPanel({
  channelId,
  threadTs,
  closeHref,
}: {
  channelId: string
  threadTs: string
  /** 닫기 버튼이 이동할 URL. 기본은 `/c/${channelId}`. */
  closeHref?: string
}) {
  const supabase = await createClient()
  const userMap = await getUserMap()

  const { data: root } = await supabase
    .from('document')
    .select('id, author, author_image_url, timestamp, content, message_ts')
    .eq('channel_id', channelId)
    .eq('message_ts', threadTs)
    .is('parent_id', null)
    .maybeSingle()

  const resolvedCloseHref = closeHref ?? `/c/${channelId}`

  if (!root) {
    return (
      <ThreadShell closeHref={resolvedCloseHref}>
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-sm text-zinc-500">
          스레드를 찾을 수 없습니다.
        </div>
      </ThreadShell>
    )
  }

  const { data: replies } = await supabase
    .from('document')
    .select('id, author, author_image_url, timestamp, content, message_ts')
    .eq('parent_id', root.id)
    .order('timestamp', { ascending: true })

  const replyList = replies ?? []

  return (
    <ThreadShell closeHref={resolvedCloseHref}>
      <div className="flex-1 overflow-y-auto">
        <Message message={root} compact userMap={userMap} />
        <div className="px-4 py-2 text-xs font-medium text-zinc-500">
          답글 {replyList.length}개
        </div>
        <div className="pb-4">
          {replyList.map((r) => (
            <Message key={r.id} message={r} compact userMap={userMap} />
          ))}
        </div>
      </div>
    </ThreadShell>
  )
}

function ThreadShell({
  closeHref,
  children,
}: {
  closeHref: string
  children: React.ReactNode
}) {
  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-zinc-200 bg-white">
      {/* Header — 고정 */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">스레드</h3>
        <Link
          href={closeHref}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="스레드 닫기"
        >
          <CloseIcon />
        </Link>
      </header>
      {children}
    </aside>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
