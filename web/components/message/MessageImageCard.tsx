export function MessageImageCard({ src, alt }: { src: string; alt?: string }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="my-0.5 inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-hover px-2 py-1 text-xs text-text-muted transition-colors hover:border-text-link hover:text-text-strong"
      title={alt || src}
    >
      <ImageIcon />
      <span>이미지{alt ? ` · ${alt}` : ''}</span>
    </a>
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
