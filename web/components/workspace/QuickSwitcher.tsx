'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  Dialog,
  DialogContent,
  DialogHiddenTitle,
  DialogHiddenDescription,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { compactCount } from '@/lib/utils/format'

type Channel = { id: string; name: string; msg_count: number | null }

export function QuickSwitcher({ channels }: { channels: Channel[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault()
      toggle()
    },
    { enableOnFormTags: true, enableOnContentEditable: true },
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <DialogHiddenTitle>채널 빠른 이동</DialogHiddenTitle>
        <DialogHiddenDescription>
          채널 이름을 입력해 빠르게 이동합니다
        </DialogHiddenDescription>
        <Command label="채널 검색">
          <CommandInput placeholder="채널 이름으로 이동…" />
          <CommandList>
            <CommandEmpty>일치하는 채널이 없습니다.</CommandEmpty>
            {channels.map((c) => (
              <CommandItem
                key={c.id}
                value={c.name}
                onSelect={() => {
                  setOpen(false)
                  router.push(`/c/${c.id}`)
                }}
              >
                <span className="text-text-muted">#</span>
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-text-muted tabular-nums">
                  {compactCount(c.msg_count ?? 0)}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
