import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * 아카이브 백엔드 호출 (서버 전용).
 *
 * Supabase 세션의 access token 을 `Authorization: Bearer` 로 붙인다. 백엔드가 그 토큰에서 Slack user id 를 꺼내
 * 채널 권한을 정한다 — UI 는 "내가 누구인지" 를 보내지 않는다. 브라우저에서 부르지 않는 이유는 둘이다.
 * 백엔드 URL 과 CORS 를 공개할 필요가 없고, 브라우저 코드가 토큰을 다룰 일이 없다.
 * 브라우저가 필요한 것(더 보기, 퀵서치)은 `app/api/*` 라우트 핸들러가 여기로 중계한다.
 */
const BASE = (process.env.ARCHIVE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
    public path: string,
  ) {
    super(`archive api ${status} ${path}`)
  }
}

async function accessToken(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  if (!BASE) throw new ApiError(503, 'ARCHIVE_API_URL 이 설정되지 않았습니다', path)
  const token = await accessToken()
  if (!token) throw new ApiError(401, 'no session', path)

  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  }
  const url = `${BASE}/api/v1${path}${qs.size ? `?${qs}` : ''}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new ApiError(res.status, detail, path)
  }
  return (await res.json()) as T
}

/** 바이너리 중계용. 성공 Response 를 그대로 돌려주고 실패는 ApiError. 호출자가 body 를 스트리밍한다. */
export async function apiFetchRaw(path: string): Promise<Response> {
  if (!BASE) throw new ApiError(503, 'ARCHIVE_API_URL 이 설정되지 않았습니다', path)
  const token = await accessToken()
  if (!token) throw new ApiError(401, 'no session', path)
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new ApiError(res.status, detail, path)
  }
  return res
}

/** 404 를 null 로. "없거나 볼 수 없음" 은 백엔드가 구분하지 않는다 (존재 여부가 곧 정보). */
export async function apiGetOrNull<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T | null> {
  try {
    return await apiGet<T>(path, params)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}
