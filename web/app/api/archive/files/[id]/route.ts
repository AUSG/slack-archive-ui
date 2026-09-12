import { NextResponse } from 'next/server'
import { apiFetchRaw, ApiError } from '@/lib/api/client'

/**
 * 첨부 파일 바이너리. `<img src>` 는 Authorization 헤더를 붙일 수 없으므로 같은 오리진에서 세션 토큰을 붙여 중계한다.
 * 권한은 백엔드가 건다 (그 파일이 붙은 메시지의 채널을 볼 수 있는 사람만). 못 받은 파일은 백엔드가 404 + {status}.
 * 파일은 불변이라 브라우저 캐시를 하루 둔다. private — 권한은 바뀔 수 있다.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!/^[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400 })
  try {
    const upstream = await apiFetchRaw(`/files/${id}`)
    const headers = new Headers()
    for (const h of ['content-type', 'content-length', 'content-disposition']) {
      const v = upstream.headers.get(h)
      if (v) headers.set(h, v)
    }
    headers.set('cache-control', 'private, max-age=86400')
    return new Response(upstream.body, { status: 200, headers })
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return NextResponse.json({ error: 'archive api error' }, { status })
  }
}
