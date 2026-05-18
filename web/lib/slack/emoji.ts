type EmojiData = {
  emojis: Record<string, { skins: Array<{ native: string }> }>
  aliases?: Record<string, string>
}

let cache: Promise<EmojiData> | null = null

async function load(): Promise<EmojiData> {
  if (!cache) {
    cache = import('@emoji-mart/data').then((m) => (m.default ?? m) as EmojiData)
  }
  return cache
}

export async function emojiUnicode(name: string): Promise<string | null> {
  const d = await load()
  const id = d.aliases?.[name] ?? name
  const e = d.emojis[id]
  return e?.skins?.[0]?.native ?? null
}

const SYNC_CACHE = new Map<string, string | null>()

export function emojiUnicodeSync(name: string): string | null | undefined {
  return SYNC_CACHE.get(name)
}

export function setEmojiUnicodeSync(name: string, val: string | null) {
  SYNC_CACHE.set(name, val)
}
