'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * 모바일에서는 사이드바 / 메인 영역을 한 번에 하나만 보이도록 토글.
 * - `/` (홈) → 사이드바 풀스크린
 * - 그 외 (`/c/...`, `/search` ...) → 메인 풀스크린
 *
 * 데스크탑(md+)에서는 둘 다 보이고 사이드바는 고정 너비.
 */
export function MobileNavWrapper({
  sidebar,
  main,
}: {
  sidebar: React.ReactNode
  main: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePath = pathname === '/'

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className={cn(
          'h-full',
          isHomePath ? 'flex w-full' : 'hidden',
          'md:flex md:w-64 md:shrink-0',
        )}
      >
        {sidebar}
      </div>
      <main
        className={cn(
          'h-full min-w-0 flex-col overflow-hidden bg-white',
          isHomePath ? 'hidden' : 'flex flex-1',
          'md:flex md:flex-1',
        )}
      >
        {main}
      </main>
    </div>
  )
}
