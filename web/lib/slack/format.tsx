'use client'

import * as React from 'react'
import { emojiUnicode, emojiUnicodeSync, setEmojiUnicodeSync } from './emoji'

const subscribers = new Map<string, Set<() => void>>()
const fetched = new Set<string>()

function ensureFetch(name: string) {
  if (emojiUnicodeSync(name) !== undefined) return
  if (fetched.has(name)) return
  fetched.add(name)
  emojiUnicode(name).then((u) => {
    setEmojiUnicodeSync(name, u)
    subscribers.get(name)?.forEach((cb) => cb())
  })
}

function subscribeEmoji(name: string, cb: () => void) {
  let set = subscribers.get(name)
  if (!set) {
    set = new Set()
    subscribers.set(name, set)
  }
  set.add(cb)
  ensureFetch(name)
  return () => {
    set!.delete(cb)
  }
}

function getServerEmoji() {
  return undefined
}

export function ExtLink({
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
      className="text-text-link hover:underline"
    >
      {children}
    </a>
  )
}

export function Mention({ userId, label }: { userId: string; label?: string }) {
  return (
    <span className="rounded bg-mention-bg px-1 font-medium text-mention-fg">
      @{label ?? userId}
    </span>
  )
}

export function ChannelRef({
  channelId,
  label,
}: {
  channelId: string
  label?: string
}) {
  return (
    <a
      href={`/c/${channelId}`}
      className="rounded bg-mention-bg px-1 font-medium text-mention-fg hover:underline"
    >
      #{label ?? channelId}
    </a>
  )
}

export function SpecialMention({ name }: { name: string }) {
  return (
    <span className="rounded bg-yellow-100 px-1 font-medium text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
      @{name}
    </span>
  )
}

export function EmojiSpan({ name }: { name: string }) {
  const subscribe = React.useMemo(
    () => (cb: () => void) => subscribeEmoji(name, cb),
    [name],
  )
  const getSnapshot = React.useCallback(
    () => emojiUnicodeSync(name),
    [name],
  )
  const val = React.useSyncExternalStore(subscribe, getSnapshot, getServerEmoji)

  if (val) return <span aria-label={`:${name}:`}>{val}</span>
  return <span className="text-text-muted">:{name}:</span>
}

