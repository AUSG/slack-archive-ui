'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: '#ffffff',
            color: '#1d1c1d',
          }}
        >
          <div style={{ maxWidth: '420px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
              앱을 시작할 수 없어요
            </h1>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#696969' }}>
              잠시 후 다시 시도해주세요.
            </p>
            {error.digest && (
              <p
                style={{
                  marginTop: '8px',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '11px',
                  color: '#696969',
                }}
              >
                오류 ID: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: '24px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#ffffff',
                background: '#1d1c1d',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
