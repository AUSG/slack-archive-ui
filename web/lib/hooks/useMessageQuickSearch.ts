'use client'

import { useEffect, useRef, useState } from 'react'

export type QuickSearchMessage = {
  id: number
  channel_id: string | null
  channel_name: string | null
  author: string | null
  content_excerpt: string
  message_ts: string | null
  timestamp: string | null
  thread_ts: string | null
}

type State = {
  results: QuickSearchMessage[]
  loading: boolean
  error: string | null
}

const DEBOUNCE_MS = 250

export function useMessageQuickSearch(query: string): State {
  const [state, setState] = useState<State>({
    results: [],
    loading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setState({ results: [], loading: false, error: null })
      abortRef.current?.abort()
      abortRef.current = null
      return
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      setState((s) => ({ ...s, loading: true, error: null }))

      fetch(`/api/quick-search?q=${encodeURIComponent(trimmed)}`, {
        signal: ac.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string }
            throw new Error(body.error ?? `HTTP ${res.status}`)
          }
          return res.json() as Promise<{ messages: QuickSearchMessage[] }>
        })
        .then((body) => {
          setState({ results: body.messages, loading: false, error: null })
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setState({
            results: [],
            loading: false,
            error: err instanceof Error ? err.message : 'unknown',
          })
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return state
}
