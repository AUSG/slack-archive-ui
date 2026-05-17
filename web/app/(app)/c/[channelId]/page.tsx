import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChannelMessages } from '@/components/channel-messages'
import { ThreadPanel } from '@/components/thread-panel'
import { getUserMap } from '@/lib/data/users'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'
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
    .select('id, author, author_image_url, timestamp, content, message_ts, reply_count, last_reply_at, reply_authors')
    .eq('channel_id', channelId)
    .is('parent_id', null)
    .order('timestamp', { ascending: false })
    .limit(INITIAL_PAGE_SIZE)

  return (
    <div className="flex h-full overflow-hidden">
      <section
        className={cn(
          'h-full min-w-0 flex-1 flex-col',
          threadTs ? 'hidden md:flex' : 'flex',
        )}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <Link
            href="/"
            className="-ml-1 inline-flex shrink-0 items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            aria-label="채널 목록으로"
          >
            <BackIcon />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-zinc-900">
              <span className="mr-1 text-zinc-400">#</span>
              {channel.name}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              총 {channel.msg_count?.toLocaleString() ?? 0}개 메시지
            </p>
          </div>
        </header>

        <ChannelMessages
          key={channelId}
          channelId={channelId}
          initialMessages={messages ?? []}
          userMap={userMap}
        />
      </section>

      {threadTs && (
        <div className="h-full w-full shrink-0 md:w-[420px]">
          <ThreadPanel channelId={channelId} threadTs={threadTs} />
        </div>
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}
