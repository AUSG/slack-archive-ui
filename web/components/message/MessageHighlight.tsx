'use client'

import { useHashHighlight } from '@/lib/hooks/useHashHighlight'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

export function MessageHighlight({
  ts,
  children,
}: {
  ts: string | null
  children: React.ReactNode
}) {
  const hot = useHashHighlight()
  const ref = useRef<HTMLDivElement>(null)
  const isHot = ts && hot === ts

  useEffect(() => {
    if (isHot && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isHot])

  return (
    <div
      ref={ref}
      id={ts ? `msg-${ts}` : undefined}
      className={cn(isHot && 'msg-pulse')}
    >
      {children}
    </div>
  )
}
