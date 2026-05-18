'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHiddenTitle,
  DialogHiddenDescription,
} from '@/components/ui/dialog'

export function MessageImageCard({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="my-0.5 inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-xs text-text-muted transition-colors hover:border-text-link hover:text-text-strong"
        title={src}
      >
        <ImageIcon />
        이미지
      </a>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-1 block max-w-md overflow-hidden rounded-md border border-border-soft bg-surface transition-colors hover:border-text-link"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ''}
            loading="lazy"
            onError={() => setBroken(true)}
            className="block max-h-80 w-full object-cover"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl p-2">
        <DialogHiddenTitle>{alt || '이미지 미리보기'}</DialogHiddenTitle>
        <DialogHiddenDescription>
          {alt || '메시지에 첨부된 이미지'}
        </DialogHiddenDescription>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ''}
            onError={() => setBroken(true)}
            className="block max-h-[80vh] w-full rounded-lg object-contain"
          />
          <DialogClose
            aria-label="닫기"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/40 text-white hover:bg-black/60"
          >
            ×
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ImageIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}
