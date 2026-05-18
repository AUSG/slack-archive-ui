'use client'

import { usePathname } from 'next/navigation'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'

export function MobileNav({
  rail,
  sidebar,
  main,
}: {
  rail: React.ReactNode
  sidebar: React.ReactNode
  main: React.ReactNode
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className={cn(
          'h-full w-full md:hidden',
          isHome ? 'flex' : 'hidden',
        )}
      >
        {sidebar}
      </div>
      <main
        className={cn(
          'h-full w-full min-w-0 flex-col overflow-hidden bg-background md:hidden',
          isHome ? 'hidden' : 'flex',
        )}
      >
        {main}
      </main>

      <div className="hidden h-full w-full md:flex">
        {rail}
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={14} maxSize={32}>
            {sidebar}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80} minSize={40}>
            <main className="flex h-full min-w-0 flex-col overflow-hidden bg-background">
              {main}
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
