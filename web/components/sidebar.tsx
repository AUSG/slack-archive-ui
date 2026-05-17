'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Channel = {
  id: string
  name: string
  msg_count: number | null
}

export function Sidebar({
  channels,
  displayName,
  avatarUrl,
}: {
  channels: Channel[]
  displayName: string
  avatarUrl: string | null
}) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-[#3F0E40] text-zinc-50">
      {/* Header — 고정 */}
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <h1 className="text-base font-bold">Slack 아카이브</h1>
        <p className="mt-0.5 text-xs text-white/60">읽기 전용 아카이브</p>
      </div>

      {/* Channel list — 가운데만 스크롤 */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="mb-3">
          <li>
            <Link
              href="/search"
              className={cn(
                'flex items-center gap-2 rounded px-3 py-1 text-sm transition-colors',
                pathname.startsWith('/search')
                  ? 'bg-[#1164A3] text-white'
                  : 'text-white/85 hover:bg-white/10',
              )}
            >
              <SearchIcon />
              <span>검색</span>
            </Link>
          </li>
        </ul>

        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/50">
          Channels
        </div>
        <ul className="mt-1 space-y-px">
          {channels.map((ch) => {
            const href = `/c/${ch.id}`
            const isActive = pathname === href
            return (
              <li key={ch.id}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded px-3 py-1 text-sm transition-colors',
                    isActive
                      ? 'bg-[#1164A3] text-white'
                      : 'text-white/85 hover:bg-white/10',
                  )}
                >
                  <span
                    className={cn(
                      isActive ? 'text-white/80' : 'text-white/55',
                    )}
                  >
                    #
                  </span>
                  <span className="truncate">{ch.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profile — 고정 */}
      <div className="flex shrink-0 items-center gap-3 border-t border-white/10 px-4 py-3">
        <Avatar className="h-8 w-8 rounded">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-white/10 text-xs text-white">
            {displayName.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">
            {displayName}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
