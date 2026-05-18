'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/lib/theme/useTheme'

export function UserMenu({
  displayName,
  avatarUrl,
  email,
}: {
  displayName: string
  avatarUrl: string | null
  email?: string | null
}) {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${displayName} 메뉴`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-sidebar-hover"
        >
          <Avatar className="h-7 w-7 rounded-md">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="rounded-md bg-sidebar-hover text-xs text-sidebar-fg">
              {displayName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="min-w-[240px]">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-strong">
            {displayName}
          </span>
          {email && <span className="text-xs text-text-muted">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>테마</DropdownMenuLabel>
        {(['system', 'light', 'dark'] as const).map((m) => (
          <DropdownMenuItem
            key={m}
            onSelect={(e) => {
              e.preventDefault()
              setTheme(m)
            }}
            className="justify-between"
          >
            <span>
              {m === 'system' ? '시스템' : m === 'light' ? '라이트' : '다크'}
            </span>
            {theme === m && <Check />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">
              로그아웃
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
