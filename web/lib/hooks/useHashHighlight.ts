'use client'

import { useEffect, useState } from 'react'

export function useHashHighlight(): string | null {
  const [hot, setHot] = useState<string | null>(null)

  useEffect(() => {
    const apply = () => {
      const h = window.location.hash
      const m = h.match(/^#msg-(.+)$/)
      if (!m) return
      const ts = decodeURIComponent(m[1])
      setHot(ts)
      const t = setTimeout(() => setHot(null), 1400)
      return () => clearTimeout(t)
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  return hot
}
