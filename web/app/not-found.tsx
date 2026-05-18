import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">404</p>
        <h1 className="mt-2 text-xl font-bold text-text-strong">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          요청하신 채널이나 메시지가 없어요. 채널 이름이 변경되었거나 삭제됐을 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-md bg-text-strong px-4 py-2 text-sm font-medium text-surface hover:opacity-90"
        >
          홈으로
        </Link>
      </div>
    </div>
  )
}
