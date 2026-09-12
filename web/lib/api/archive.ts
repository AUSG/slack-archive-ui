import 'server-only'
import { cache } from 'react'
import { apiGet, apiGetOrNull } from './client'
import type {
  ApiChannel,
  ApiMessagesPage,
  ApiSearch,
  ApiThread,
  ApiUser,
} from './types'

/** 요청 한 번에 한 번만. 레이아웃·페이지·스레드 패널이 같은 렌더에서 각자 부른다. */
export const getChannels = cache(async (): Promise<ApiChannel[]> => apiGet<ApiChannel[]>('/channels'))

export const getChannel = cache(async (id: string): Promise<ApiChannel | null> =>
  apiGetOrNull<ApiChannel>(`/channels/${encodeURIComponent(id)}`),
)

export async function getMessages(
  channelId: string,
  opts: { before?: string | null; limit?: number } = {},
): Promise<ApiMessagesPage | null> {
  return apiGetOrNull<ApiMessagesPage>(`/channels/${encodeURIComponent(channelId)}/messages`, {
    before: opts.before ?? undefined,
    limit: opts.limit ?? 50,
  })
}

export async function getThread(channelId: string, threadTs: string): Promise<ApiThread | null> {
  return apiGetOrNull<ApiThread>(
    `/channels/${encodeURIComponent(channelId)}/threads/${encodeURIComponent(threadTs)}`,
  )
}

/** 워크스페이스 전원 (탈퇴 제외, 봇 포함). 200명 규모. */
export const getAllUsers = cache(async (): Promise<ApiUser[]> => apiGet<ApiUser[]>('/users'))

export async function searchMessages(params: {
  q: string
  channel?: string
  user?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}): Promise<ApiSearch> {
  return apiGet<ApiSearch>('/search', {
    q: params.q,
    channel: params.channel,
    user: params.user,
    from: params.from,
    to: params.to,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  })
}
