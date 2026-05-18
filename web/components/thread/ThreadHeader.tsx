import Link from 'next/link'

export function ThreadHeader({
  channelName,
  replyCount,
  closeHref,
}: {
  channelName: string | null
  replyCount: number
  closeHref: string
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border-soft bg-surface px-4 py-3">
      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-text-strong">스레드</h3>
        <p className="text-xs text-text-muted">
          {channelName ? `#${channelName} · ` : ''}
          답글 {replyCount}개
        </p>
      </div>
      <Link
        href={closeHref}
        className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-strong"
        aria-label="스레드 닫기"
      >
        <CloseIcon />
      </Link>
    </header>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
