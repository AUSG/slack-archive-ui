import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MessageList } from '@/components/message/MessageList'
import { ThreadPanel } from '@/components/thread/ThreadPanel'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { getUserMap } from '@/lib/data/users'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'
import { slackChannelUrl } from '@/lib/slack/deep-link'
import { compactCount } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

const INITIAL_PAGE_SIZE = 50

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { channelId } = await params
  const { t: threadTs } = await searchParams
  const supabase = await createClient()

  const [{ data: channel }, userMap] = await Promise.all([
    supabase
      .from('channel')
      .select('id, name, msg_count')
      .eq('id', channelId)
      .not('name', 'ilike', HIDDEN_NAME_LIKE)
      .not('name', 'imatch', HIDDEN_NAME_REGEX)
      .maybeSingle(),
    getUserMap(),
  ])

  if (!channel) notFound()

  const { data: messages } = await supabase
    .from('document')
    .select(
      'id, author, author_image_url, timestamp, content, message_ts, reply_count, last_reply_at, reply_authors',
    )
    .eq('channel_id', channelId)
    .is('parent_id', null)
    .order('timestamp', { ascending: false })
    .limit(INITIAL_PAGE_SIZE)

  const main = (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border-soft bg-surface px-4 py-3 md:px-6">
        <Link
          href="/"
          className="-ml-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-strong md:hidden"
          aria-label="채널 목록으로"
        >
          <BackIcon />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[18px] font-extrabold text-text-strong">
            <span className="mr-1 text-text-muted">#</span>
            {channel.name}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            총 {compactCount(channel.msg_count ?? 0) || '0'}개 메시지
          </p>
        </div>
        <a
          href={slackChannelUrl(channel.id)}
          className="hidden items-center gap-1 rounded-md border border-border-soft bg-surface px-2.5 py-1 text-xs text-text-muted hover:bg-surface-hover hover:text-text-strong md:inline-flex"
          title="Slack 앱에서 열기"
        >
          <ExtIcon />
          Slack에서 열기
        </a>
      </header>

      <MessageList
        key={channelId}
        channelId={channelId}
        initialMessages={messages ?? []}
        userMap={userMap}
      />
    </section>
  )

  if (!threadTs) {
    return <div className="flex h-full overflow-hidden">{main}</div>
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className={cn('flex h-full w-full md:hidden')}>
        <ThreadPanel channelId={channelId} threadTs={threadTs} />
      </div>
      <div className="hidden h-full w-full md:flex">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={65} minSize={40}>
            {main}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <ThreadPanel channelId={channelId} threadTs={threadTs} />
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
function ExtIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
