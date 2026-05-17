'use client'

import { createClient } from '@/lib/supabase/client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: '인증 코드가 전달되지 않았습니다. 다시 시도해주세요.',
  exchange_failed: '세션 교환에 실패했습니다. 잠시 후 다시 시도해주세요.',
  wrong_workspace:
    'AUSG (au-sg.slack.com) 외 다른 워크스페이스로 로그인하셨습니다. AUSG 계정으로 다시 시도해주세요.',
  access_denied: 'Slack 동의가 취소되었습니다.',
}

export default function LoginPage() {
  return (
    <main className="flex h-full items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          AUSG Slack 아카이브
        </h1>
        <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
          <a
            href="https://au-sg.slack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50"
          >
            au-sg.slack.com
          </a>
          {' '}워크스페이스의 멤버만 로그인할 수 있어요.
        </p>
        <p className="mb-8 text-xs text-zinc-500 dark:text-zinc-500">
          아래 버튼을 클릭하면 Slack 동의 화면으로 이동하고, 승인 후 자동으로 돌아옵니다.
        </p>

        <Suspense fallback={null}>
          <ErrorBanner />
        </Suspense>

        <LoginButton />
      </div>
    </main>
  )
}

function ErrorBanner() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMsg = errorCode ? (ERROR_MESSAGES[errorCode] ?? errorCode) : null
  if (!errorMsg) return null
  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {errorMsg}
    </div>
  )
}

function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'slack_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          team: process.env.NEXT_PUBLIC_SLACK_TEAM_ID!,
        },
      },
    })
    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#4A154B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d1140] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span>연결 중…</span>
      ) : (
        <>
          <SlackLogo />
          <span>Sign in with Slack</span>
        </>
      )}
    </button>
  )
}

function SlackLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.04 15.165a2.523 2.523 0 0 1-2.52 2.523A2.523 2.523 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.522H5.04zM6.313 15.165a2.527 2.527 0 0 1 2.522-2.522 2.527 2.527 0 0 1 2.523 2.522v6.313A2.527 2.527 0 0 1 8.835 24a2.527 2.527 0 0 1-2.522-2.522zM8.835 5.042a2.523 2.523 0 0 1-2.522-2.52A2.523 2.523 0 0 1 8.835 0a2.527 2.527 0 0 1 2.523 2.522v2.52zM8.835 6.313a2.527 2.527 0 0 1 2.523 2.523 2.527 2.527 0 0 1-2.523 2.52H2.522A2.527 2.527 0 0 1 0 8.836a2.527 2.527 0 0 1 2.522-2.523zM18.956 8.836a2.523 2.523 0 0 1 2.522-2.523A2.523 2.523 0 0 1 24 8.836a2.527 2.527 0 0 1-2.522 2.52h-2.522zM17.688 8.836a2.527 2.527 0 0 1-2.523 2.52 2.527 2.527 0 0 1-2.523-2.52V2.522A2.527 2.527 0 0 1 15.165 0a2.527 2.527 0 0 1 2.523 2.522zM15.165 18.956a2.523 2.523 0 0 1 2.523 2.522A2.523 2.523 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.527 2.527 0 0 1 2.523-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.527 2.527 0 0 1-2.522 2.523z"
        fill="currentColor"
      />
    </svg>
  )
}
