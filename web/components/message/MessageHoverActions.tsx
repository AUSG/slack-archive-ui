'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { slackMessageUrl } from '@/lib/slack/deep-link'

export function MessageHoverActions({
  channelId,
  messageTs,
  threadHref,
}: {
  channelId: string | null
  messageTs: string | null
  threadHref: string | null
}) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  if (!channelId || !messageTs) return null

  const copyLink = async () => {
    const url = `${window.location.origin}/c/${channelId}#msg-${messageTs}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <TooltipProvider>
      <div
        className="absolute right-2 top-2 hidden items-center gap-0.5 rounded-md border border-border-soft bg-surface p-0.5 shadow-sm group-hover:flex"
        role="toolbar"
        aria-label="메시지 액션"
      >
        {threadHref && (
          <ActionButton
            label="스레드 보기"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(threadHref)
            }}
          >
            <ThreadIcon />
          </ActionButton>
        )}
        <ActionButton onClick={() => copyLink()} label={copied ? '복사 완료' : '메시지 링크 복사'}>
          <LinkIcon />
        </ActionButton>
        <ActionButton
          label="Slack에서 열기"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            window.open(slackMessageUrl(channelId, messageTs), '_blank', 'noopener,noreferrer')
          }}
        >
          <ExternalIcon />
        </ActionButton>
      </div>
    </TooltipProvider>
  )
}

function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ThreadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
