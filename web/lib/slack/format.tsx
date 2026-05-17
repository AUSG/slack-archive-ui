import * as React from 'react'
import { get as getEmoji } from 'node-emoji'
import type { UserMap } from '@/lib/data/users'

/**
 * Slack 마크업을 React 노드로 렌더링.
 *
 * 지원:
 * - 코드 블록 ```...```
 * - 인라인 코드 `...`
 * - 앵글 엔티티 <@U..>, <#C..|name>, <!here>, <!channel>, <!everyone>, <!subteam^..|name>, <!date^..|fb>, <url>, <url|label>
 * - *bold*, _italic_, ~strike~
 * - :emoji: (node-emoji 매핑, 미매핑은 raw 텍스트로)
 * - 베어 URL https://... 자동 링크
 * - HTML 엔티티 디코드 (&amp; &lt; &gt;)
 *
 * 제약 (v1):
 * - 포매팅 중첩 미지원 (예: *bold _italic_* 은 외부만 인식)
 * - 앵글 엔티티가 포매팅 안에 있으면 시각 포매팅이 끊김
 */
export function renderSlackMarkup(
  content: string | null | undefined,
  userMap?: UserMap,
): React.ReactNode {
  if (!content) return null
  return parseCodeBlocks(content, userMap ?? {})
}

function decode(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function parseCodeBlocks(text: string, userMap: UserMap): React.ReactNode {
  const parts = text.split(/```([\s\S]*?)```/)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <pre
          key={`cb-${i}`}
          className="my-1 overflow-x-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900"
        >
          {decode(part)}
        </pre>
      )
    }
    return <React.Fragment key={`p-${i}`}>{parseInlineCode(part, userMap)}</React.Fragment>
  })
}

function parseInlineCode(text: string, userMap: UserMap): React.ReactNode {
  const parts = text.split(/`([^`\n]+)`/)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <code
          key={`ic-${i}`}
          className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-[0.85em] text-rose-700"
        >
          {decode(part)}
        </code>
      )
    }
    return <React.Fragment key={`p-${i}`}>{parseAngles(part, userMap)}</React.Fragment>
  })
}

function parseAngles(text: string, userMap: UserMap): React.ReactNode {
  const re = /<([^<>]+)>/g
  const result: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      const slice = text.slice(last, match.index)
      result.push(
        <React.Fragment key={`fp-${i++}`}>{parseFormatting(slice)}</React.Fragment>,
      )
    }
    result.push(
      <React.Fragment key={`fa-${i++}`}>{renderAngleEntity(match[1], userMap)}</React.Fragment>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) {
    result.push(
      <React.Fragment key={`fp-${i++}`}>{parseFormatting(text.slice(last))}</React.Fragment>,
    )
  }
  return result
}

function renderAngleEntity(inner: string, userMap: UserMap): React.ReactNode {
  // User mention: <@U07XXX> or <@U07XXX|display>
  if (inner.startsWith('@')) {
    const body = inner.slice(1)
    const [userId, label] = splitOnce(body, '|')
    const resolved = label ?? userMap[userId]
    return <Mention userId={userId} label={resolved} />
  }

  // Channel ref: <#C123> or <#C123|name>
  if (inner.startsWith('#')) {
    const body = inner.slice(1)
    const [channelId, label] = splitOnce(body, '|')
    return <ChannelRef channelId={channelId} label={label} />
  }

  // Special commands: <!here>, <!channel>, <!everyone>, <!subteam^...|name>, <!date^...|fb>
  if (inner.startsWith('!')) {
    const body = inner.slice(1)
    const [cmd, fallback] = splitOnce(body, '|')
    if (cmd === 'here' || cmd === 'channel' || cmd === 'everyone') {
      return <SpecialMention name={cmd} />
    }
    if (cmd.startsWith('subteam^')) {
      return <Mention userId={cmd} label={fallback ?? 'group'} />
    }
    if (cmd.startsWith('date^')) {
      return <span>{fallback ?? inner}</span>
    }
    return <span>{fallback ?? cmd}</span>
  }

  // URL: <url> or <url|label>
  const [href, label] = splitOnce(inner, '|')
  if (!/^https?:\/\//i.test(href)) {
    return <span>{inner}</span>
  }
  return <ExtLink href={href}>{label ?? href}</ExtLink>
}

function parseFormatting(text: string): React.ReactNode {
  const decoded = decode(text)
  const re =
    /\*([^*\s][^*\n]*?[^*\s])\*|\*([^*\s])\*|_([^_\s][^_\n]*?[^_\s])_|_([^_\s])_|~([^~\s][^~\n]*?[^~\s])~|~([^~\s])~|:([a-z0-9_+-]+):|(https?:\/\/[^\s<>)"']+)/gi

  const result: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(decoded)) !== null) {
    if (match.index > last) {
      result.push(decoded.slice(last, match.index))
    }
    const k = `t-${i++}`
    if (match[1] !== undefined || match[2] !== undefined) {
      result.push(
        <strong key={k} className="font-bold">
          {match[1] ?? match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined || match[4] !== undefined) {
      result.push(
        <em key={k} className="italic">
          {match[3] ?? match[4]}
        </em>,
      )
    } else if (match[5] !== undefined || match[6] !== undefined) {
      result.push(<s key={k}>{match[5] ?? match[6]}</s>)
    } else if (match[7] !== undefined) {
      result.push(<EmojiSpan key={k} name={match[7]} />)
    } else if (match[8] !== undefined) {
      result.push(
        <ExtLink key={k} href={match[8]}>
          {match[8]}
        </ExtLink>,
      )
    }
    last = match.index + match[0].length
  }
  if (last < decoded.length) result.push(decoded.slice(last))
  return result
}

function splitOnce(s: string, sep: string): [string, string | undefined] {
  const idx = s.indexOf(sep)
  if (idx < 0) return [s, undefined]
  return [s.slice(0, idx), s.slice(idx + 1)]
}

function ExtLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#1264a3] hover:underline"
    >
      {children}
    </a>
  )
}

function Mention({ userId, label }: { userId: string; label?: string }) {
  return (
    <span className="rounded bg-blue-50 px-1 font-medium text-blue-700">
      @{label ?? userId}
    </span>
  )
}

function ChannelRef({
  channelId,
  label,
}: {
  channelId: string
  label?: string
}) {
  return (
    <a
      href={`/c/${channelId}`}
      className="rounded bg-blue-50 px-1 font-medium text-blue-700 hover:underline"
    >
      #{label ?? channelId}
    </a>
  )
}

function SpecialMention({ name }: { name: string }) {
  return (
    <span className="rounded bg-yellow-100 px-1 font-medium text-yellow-900">
      @{name}
    </span>
  )
}

function EmojiSpan({ name }: { name: string }) {
  const found = getEmoji(name)
  if (found) {
    return <span aria-label={`:${name}:`}>{found}</span>
  }
  return <span className="text-zinc-500">:{name}:</span>
}
