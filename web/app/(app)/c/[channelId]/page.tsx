import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChannelMessages } from '@/components/channel-messages'
import { ThreadPanel } from '@/components/thread-panel'
import { getUserMap } from '@/lib/data/users'

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
      .maybeSingle(),
    getUserMap(),
  ])

  if (!channel) notFound()

  const { data: messages } = await supabase
    .from('document')
    .select('id, author, author_image_url, timestamp, content, message_ts')
    .eq('channel_id', channelId)
    .is('parent_id', null)
    .order('timestamp', { ascending: false })
    .limit(INITIAL_PAGE_SIZE)

  const topLevelIds = (messages ?? []).map((m) => m.id)
  const replyCounts: Record<number, number> = {}

  if (topLevelIds.length > 0) {
    const { data: replyRows } = await supabase
      .from('document')
      .select('parent_id')
      .in('parent_id', topLevelIds)

    for (const r of replyRows ?? []) {
      if (r.parent_id != null) {
        replyCounts[r.parent_id] = (replyCounts[r.parent_id] ?? 0) + 1
      }
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <section className="flex h-full min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-3">
          <h2 className="text-base font-semibold text-zinc-900">
            <span className="mr-1 text-zinc-400">#</span>
            {channel.name}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            총 {channel.msg_count?.toLocaleString() ?? 0}개 메시지
          </p>
        </header>

        <ChannelMessages
          key={channelId}
          channelId={channelId}
          initialMessages={messages ?? []}
          initialReplyCounts={replyCounts}
          userMap={userMap}
        />
      </section>

      {threadTs && <ThreadPanel channelId={channelId} threadTs={threadTs} />}
    </div>
  )
}
