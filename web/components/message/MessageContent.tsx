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
