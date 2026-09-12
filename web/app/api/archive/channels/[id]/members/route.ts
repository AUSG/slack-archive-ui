import { NextResponse } from 'next/server'
import { getChannelMembers } from '@/lib/api/archive'
import { ApiError } from '@/lib/api/client'

/**
 * 채널 참여자. 모달을 열 때 브라우저가 부르므로 같은 오리진 라우트가 세션 토큰을 붙여 중계한다.
 * private 채널의 비멤버에게는 백엔드가 404 를 주고 여기서도 404 다.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  try {
    const body = await getChannelMembers(id)
    if (!body) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({
      members: body.members.map((m) => ({
        user_id: m.user_id,
        name: m.profile.display_name || m.profile.real_name || m.user_id,
        avatar: m.profile.image_72 ?? null,
        is_bot: m.is_bot,
        deleted: m.deleted,
      })),
    })
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500
    return NextResponse.json({ error: 'archive api error' }, { status })
  }
}
