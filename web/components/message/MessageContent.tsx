import { renderSlack } from '@/lib/slack/parser'
import type { UserMap } from '@/lib/data/users'
import { MessageImageCard } from './MessageImageCard'
import { MessageCodeBlock } from './MessageCodeBlock'

export function MessageContent({
  content,
  userMap,
}: {
  content: string | null
  userMap?: UserMap
}) {
  if (!content || !content.trim()) {
    return <AttachmentPlaceholder />
  }
  return (
    <>
      {renderSlack(content, {
        userMap,
        ImageCard: MessageImageCard,
        CodeBlock: MessageCodeBlock,
      })}
    </>
  )
}

function AttachmentPlaceholder() {
  return (
    <span
      className="my-0.5 inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-xs text-text-muted"
      title="이 메시지의 본문은 비어 있습니다 (이미지·파일 첨부로 추정)"
    >
      <PaperclipIcon />
      <span>첨부 (본문 없음)</span>
    </span>
  )
}

function PaperclipIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
