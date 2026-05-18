'use client'

import { useEffect, useState } from 'react'

const ALLOWED_LANGS = new Set([
  'js', 'ts', 'tsx', 'jsx', 'json', 'yaml', 'yml', 'bash', 'sh',
  'py', 'go', 'rust', 'java', 'kotlin', 'swift', 'rb', 'php',
  'css', 'html', 'sql', 'md', 'markdown', 'txt',
])

function detectLang(code: string): string | null {
  const m = code.match(/^([a-z]+)\n/i)
  if (m && ALLOWED_LANGS.has(m[1].toLowerCase())) return m[1].toLowerCase()
  return null
}

export function MessageCodeBlock({ code }: { code: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const lang = detectLang(code)
  const body = lang ? code.replace(/^[a-z]+\n/i, '') : code

  useEffect(() => {
    if (!lang) return
    let cancelled = false
    ;(async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const out = await codeToHtml(body, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        })
        if (!cancelled) setHtml(out)
      } catch {
        setHtml(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lang, body])

  if (html) {
    return (
      <div
        className="my-1 overflow-x-auto rounded border border-border-soft text-xs [&_pre]:m-0 [&_pre]:bg-code-bg [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <pre className="my-1 overflow-x-auto whitespace-pre-wrap rounded border border-border-soft bg-code-bg px-3 py-2 font-mono text-xs text-text-strong">
      {body}
    </pre>
  )
}
