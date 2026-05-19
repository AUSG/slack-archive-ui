import Link from 'next/link'
import { GlobalSearchInput } from './GlobalSearchInput'
import { compactCount } from '@/lib/utils/format'

type Channel = { id: string; name: string; msg_count: number | null }

const EXAMPLE_QUERIES = ['회의록', '논문', '세미나']

export function HomeHero({ topChannels }: { topChannels: Channel[] }) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
          <SlackLogo />
        </div>
        <h2 className="text-lg font-bold text-text-strong">AUSG Slack 아카이브</h2>
        <p className="mt-2 text-sm text-text-muted">
          채널·사람·메시지를 검색하거나 자주 보는 채널로 빠르게 이동하세요.
        </p>

        <div className="mt-6">
          <GlobalSearchInput size="hero" />
        </div>

        {topChannels.length > 0 && (
          <div className="mt-8 text-left">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              자주 보는 채널
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topChannels.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/c/${c.id}`}
                    className="flex items-center justify-between rounded-md border border-border-soft px-3 py-2 text-sm transition-colors hover:bg-surface-hover"
                  >
                    <span className="truncate text-text-strong">
                      <span className="text-text-muted">#</span> {c.name}
                    </span>
                    <span className="text-xs text-text-muted tabular-nums">
                      {compactCount(c.msg_count ?? 0)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-left">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            예시 검색
          </h3>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-border-soft px-3 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-strong"
              >
                "{q}"
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlackLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 2447.6 2452.5" aria-hidden>
      <g clipRule="evenodd" fillRule="evenodd">
        <path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0" />
        <path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d" />
        <path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e" />
        <path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a" />
      </g>
    </svg>
  )
}
