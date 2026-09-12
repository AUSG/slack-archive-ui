import type { MsgFile } from '@/lib/data/types'

/**
 * 메시지 첨부. 받아 둔 이미지는 그대로 보이고, 못 받은 것은 이유를 적은 자리표시자다.
 * "이미지가 있었다" 는 사실은 어느 경우에도 남는다 — Slack 에서 지워진 3천여 장도 자리는 보인다.
 */
const STATUS_LABEL: Record<'deleted' | 'too_large' | 'broken' | 'pending', string> = {
  deleted: '삭제된 이미지',
  too_large: '너무 큰 이미지',
  broken: '깨진 이미지',
  pending: '이미지 준비 중',
}

function isImage(f: MsgFile): boolean {
  return f.status === 'available' && !!f.mimetype?.startsWith('image/')
}

/** 자리표시자 문구. 이미지가 아닌 파일(받지 않은 것, 또는 받았지만 이미지가 아닌 것)은 이름을 보인다. */
function chipLabel(f: MsgFile): { text: string; file: boolean } {
  if (f.status === 'not_image' || f.status === 'available') return { text: f.name ?? '파일', file: true }
  return { text: STATUS_LABEL[f.status], file: false }
}

export function MessageFiles({ files }: { files: MsgFile[] }) {
  if (files.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {files.map((f) => {
        if (isImage(f)) {
          return (
            <a
              key={f.id}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-border-soft bg-surface-hover"
              title={f.name ?? undefined}
            >
              {/* next/image 는 원격 도메인 설정이 필요하고 이 라우트는 같은 오리진이라 img 로 충분하다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.name ?? '이미지'} loading="lazy" className="max-h-80 max-w-full object-contain" />
            </a>
          )
        }
        const chip = chipLabel(f)
        return (
          <span
            key={f.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-xs text-text-muted"
            title={f.name ?? undefined}
          >
            {chip.file ? <PaperclipIcon /> : <ImageOffIcon />}
            <span>{chip.text}</span>
          </span>
        )
      })}
    </div>
  )
}

function ImageOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
