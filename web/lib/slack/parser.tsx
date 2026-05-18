import * as React from 'react'
import parse, { NodeType, type Node } from 'slack-message-parser'
import LinkifyIt from 'linkify-it'
import type { UserMap } from '@/lib/data/users'
import {
  Mention,
  ChannelRef,
  SpecialMention,
  ExtLink,
  EmojiSpan,
} from './format'

export type RenderOpts = {
  userMap?: UserMap
  CodeBlock?: React.ComponentType<{ code: string; lang?: string }>
  ImageCard?: React.ComponentType<{ src: string; alt?: string }>
}

const IMAGE_URL_RE = /\.(png|jpg|jpeg|gif|webp|avif)(\?.*)?$/i
const QUOTE_LINE_RE = /^>\s?/
const linkify = new LinkifyIt({ fuzzyLink: false, fuzzyEmail: true })

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

type Segment = { kind: 'quote' | 'normal'; text: string }

function splitQuoteSegments(content: string): Segment[] {
  const lines = content.split('\n')
  const segments: Segment[] = []
  let current: { kind: 'quote' | 'normal'; lines: string[] } | null = null
  for (const line of lines) {
    const isQuote = QUOTE_LINE_RE.test(line)
    const kind: 'quote' | 'normal' = isQuote ? 'quote' : 'normal'
    const text = isQuote ? line.replace(QUOTE_LINE_RE, '') : line
    if (current && current.kind === kind) {
      current.lines.push(text)
    } else {
      if (current) segments.push({ kind: current.kind, text: current.lines.join('\n') })
      current = { kind, lines: [text] }
    }
  }
  if (current) segments.push({ kind: current.kind, text: current.lines.join('\n') })
  return segments
}

export function renderSlack(
  content: string | null | undefined,
  opts: RenderOpts = {},
): React.ReactNode {
  if (!content) return null
  const segments = splitQuoteSegments(decodeEntities(content))
  return (
    <>
      {segments.map((seg, i) => {
        const tree = parse(seg.text)
        const body = renderNode(tree, opts, `${seg.kind}-${i}`)
        if (seg.kind === 'quote') {
          return (
            <blockquote
              key={`q-${i}`}
              className="my-0.5 border-l-4 border-border-soft pl-3 text-text-strong"
            >
              {body}
            </blockquote>
          )
        }
        return <React.Fragment key={`s-${i}`}>{body}</React.Fragment>
      })}
    </>
  )
}

function renderTextWithBareUrls(
  text: string,
  opts: RenderOpts,
  key: string,
): React.ReactNode {
  const matches = linkify.match(text)
  if (!matches || matches.length === 0) {
    return <React.Fragment key={key}>{text}</React.Fragment>
  }
  const parts: React.ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const url = m.url
    const display = m.text
    if (opts.ImageCard && IMAGE_URL_RE.test(url)) {
      parts.push(<opts.ImageCard key={`${key}-i${i}`} src={url} alt={display} />)
    } else {
      parts.push(
        <ExtLink key={`${key}-u${i}`} href={url}>
          {display}
        </ExtLink>,
      )
    }
    last = m.lastIndex
  })
  if (last < text.length) parts.push(text.slice(last))
  return <React.Fragment key={key}>{parts}</React.Fragment>
}

function renderNode(node: Node, opts: RenderOpts, key: string): React.ReactNode {
  switch (node.type) {
    case NodeType.Root:
      return node.children.map((c, i) => renderNode(c, opts, `${key}-${i}`))
    case NodeType.Text:
      return renderTextWithBareUrls(node.text, opts, key)
    case NodeType.ChannelLink:
      return (
        <ChannelRef
          key={key}
          channelId={node.channelID}
          label={node.label?.map(textOf).join('') || undefined}
        />
      )
    case NodeType.UserLink: {
      const label = node.label?.map(textOf).join('')
      const userId = node.userID
      const resolved = label || opts.userMap?.byId?.[userId]?.displayName
      return <Mention key={key} userId={userId} label={resolved} />
    }
    case NodeType.URL: {
      const url = node.url
      const label = node.label?.map(textOf).join('') ?? url
      if (opts.ImageCard && IMAGE_URL_RE.test(url)) {
        return <opts.ImageCard key={key} src={url} alt={label} />
      }
      return (
        <ExtLink key={key} href={url}>
          {label}
        </ExtLink>
      )
    }
    case NodeType.Command: {
      const name = node.name
      if (name === 'here' || name === 'channel' || name === 'everyone') {
        return <SpecialMention key={key} name={name} />
      }
      const fb = node.label?.map(textOf).join('')
      return <span key={key}>{fb || name}</span>
    }
    case NodeType.Emoji:
      return <EmojiSpan key={key} name={node.name} />
    case NodeType.Code:
      return (
        <code
          key={key}
          className="rounded border border-border-soft bg-code-bg px-1 py-0.5 font-mono text-[0.85em] text-code-fg"
        >
          {node.text}
        </code>
      )
    case NodeType.PreText: {
      const text = node.text
      if (opts.CodeBlock) {
        return <opts.CodeBlock key={key} code={text} />
      }
      return (
        <pre
          key={key}
          className="my-1 overflow-x-auto whitespace-pre-wrap rounded border border-border-soft bg-code-bg px-3 py-2 font-mono text-xs text-text-strong"
        >
          {text}
        </pre>
      )
    }
    case NodeType.Bold:
      return (
        <strong key={key} className="font-bold">
          {node.children.map((c, i) => renderNode(c, opts, `${key}-${i}`))}
        </strong>
      )
    case NodeType.Italic:
      return (
        <em key={key} className="italic">
          {node.children.map((c, i) => renderNode(c, opts, `${key}-${i}`))}
        </em>
      )
    case NodeType.Strike:
      return (
        <s key={key}>
          {node.children.map((c, i) => renderNode(c, opts, `${key}-${i}`))}
        </s>
      )
    case NodeType.Quote:
      return (
        <blockquote
          key={key}
          className="my-0.5 border-l-4 border-border-soft pl-3 text-text-strong"
        >
          {node.children.map((c, i) => renderNode(c, opts, `${key}-${i}`))}
        </blockquote>
      )
    default:
      return null
  }
}

function textOf(n: Node): string {
  if (n.type === NodeType.Text) return n.text
  if ('children' in n && Array.isArray((n as { children?: Node[] }).children)) {
    return (n as { children: Node[] }).children.map(textOf).join('')
  }
  return ''
}
