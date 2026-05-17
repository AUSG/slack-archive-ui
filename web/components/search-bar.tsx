'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Channel = { id: string; name: string }

export function SearchBar({
  channels,
  initialQuery,
  initialChannel,
}: {
  channels: Channel[]
  initialQuery: string
  initialChannel: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [ch, setCh] = useState(initialChannel)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    const trimmed = q.trim()
    if (trimmed) params.set('q', trimmed)
    if (ch) params.set('ch', ch)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="메시지 검색 (한국어 형태소 분석)"
        className="min-w-[280px] flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
        autoFocus
      />
      <select
        value={ch}
        onChange={(e) => setCh(e.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
      >
        <option value="">모든 채널</option>
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            #{c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        검색
      </button>
    </form>
  )
}
