import { NextResponse } from 'next/server'
import { getMessages } from '@/lib/api/archive'
import { ApiError } from '@/lib/api/client'
import { toMsg } from '@/lib/data/adapt'
import { getUserMap } from '@/lib/data/users'

/**
 * 채널 타임라인 "이전 메시지 더 보기". 브라우저 → 여기 → 백엔드.
 * 예전에는 브라우저가 Supabase PostgREST 를 직접 쳤다. 백엔드 URL 과 토큰이 브라우저에 갈 필요가 없어 중계한다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const before = searchParams.get('before')
  if (!channel) return NextResponse.json({ error: 'channel is required' }, { status: 400 })

  try {
    const [page, userMap] = await Promise.all([getMessages(channel, { before, limit: 50 }), getUserMap()])
    if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({
      messages: page.messages.map((m) => toMsg(m, userMap)),
      next_before: page.next_before,
    })
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return NextResponse.json({ error: 'archive api error' }, { status })
  }
}
