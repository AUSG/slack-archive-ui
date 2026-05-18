import * as React from 'react'

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function HighlightedText({
  text,
  query,
}: {
  text: string
  query: string
}) {
  if (!query.trim()) return <>{text}</>
  const re = new RegExp(`(${escapeRegex(query.trim())})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-[var(--highlight-match)] px-0.5 text-text-strong"
          >
            {p}
          </mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  )
}
