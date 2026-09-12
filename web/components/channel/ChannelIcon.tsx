import { cn } from '@/lib/utils'

/**
 * 채널 앞 아이콘. public 은 `#`, private 은 자물쇠 — Slack 과 같은 규칙이다.
 * private 채널은 현재 멤버에게만 목록에 보이므로, 이 아이콘이 곧 "여기는 참여자만 본다" 는 표시다.
 */
export function ChannelIcon({ isPrivate, className }: { isPrivate?: boolean; className?: string }) {
  if (!isPrivate) return <span className={cn('shrink-0', className)}>#</span>
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="비공개 채널"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
