'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <div className="flex h-full items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          오류
        </p>
        <h1 className="mt-2 text-xl font-bold text-text-strong">
          문제가 발생했어요
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          페이지를 표시하는 중 예기치 못한 오류가 발생했어요. 다시 시도해보시거나
          홈으로 돌아가세요.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-text-muted">
            오류 ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-text-strong px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-md border border-border-soft px-4 py-2 text-sm font-medium text-text-strong transition-colors hover:bg-surface-hover"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
