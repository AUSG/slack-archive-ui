'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UserMap } from '@/lib/data/users'
import type { ThreadInfo } from '@/lib/data/thread'
import { ThreadBadge } from './ThreadBadge'
import { MessageHoverActions } from './MessageHoverActions'
import { MessageHighlight } from './MessageHighlight'
import { MessageContent } from './MessageContent'
import {
  formatCompactHM,
  formatFullTime,
  formatMessageTime,
} from '@/lib/utils/format'
import { cn } from '@/lib/utils'

type Msg = {
  id: number
  author: string | null
  author_image_url: string | null
  timestamp: string | null
  content: string | null
  message_ts: string | null
}

export function MessageRow({
  message,
  threadInfo,
  channelId,
  compact = false,
  userMap,
  threadHref,
  showActions = true,
}: {
  message: Msg
  threadInfo?: ThreadInfo
  channelId?: string
  compact?: boolean
  userMap?: UserMap
  threadHref?: string
  showActions?: boolean
}) {
  const time = message.timestamp ? formatMessageTime(message.timestamp) : ''
  const compactTime = message.timestamp ? formatCompactHM(message.timestamp) : ''
  const fullTime = message.timestamp ? formatFullTime(message.timestamp) : ''
  const author = message.author ?? '—'
  const latestProfile = message.author
    ? userMap?.byName?.[message.author]
    : undefined
  const avatarUrl = latestProfile?.avatarUrl ?? message.author_image_url
  const resolvedThreadHref =
    threadHref ?? (channelId && message.message_ts && threadInfo
      ? `/c/${channelId}?t=${message.message_ts}`
      : null)

  return (
    <MessageHighlight ts={message.message_ts}>
      <TooltipProvider>
        <div
          className={cn(
            'group relative flex gap-3 px-4 py-0.5 md:px-6',
            'transition-colors hover:bg-surface-hover',
            compact ? 'pt-px' : 'pt-1.5',
          )}
        >
          {compact ? (
            message.timestamp ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="mt-1 w-9 shrink-0 cursor-default select-none text-right text-[10px] leading-5 text-text-muted opacity-0 group-hover:opacity-100">
                    {compactTime}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{fullTime}</TooltipContent>
              </Tooltip>
            ) : (
              <span className="mt-1 w-9 shrink-0" />
            )
          ) : (
            <Avatar className="mt-0.5 h-9 w-9 shrink-0 rounded-md">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={author} />}
              <AvatarFallback className="rounded-md bg-border-soft text-xs text-text-strong">
                {author.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            {!compact && (
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold text-text-strong">{author}</span>
                {message.timestamp && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default whitespace-nowrap text-xs text-text-muted">
                        {time}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{fullTime}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.46] text-text-strong">
              <MessageContent content={message.content} userMap={userMap} />
            </div>
            {threadInfo && resolvedThreadHref && (
              <ThreadBadge threadInfo={threadInfo} href={resolvedThreadHref} userMap={userMap} />
            )}
          </div>

          {showActions && (
            <MessageHoverActions
              channelId={channelId ?? null}
              messageTs={message.message_ts}
              threadHref={resolvedThreadHref}
            />
          )}
        </div>
      </TooltipProvider>
    </MessageHighlight>
  )
}
