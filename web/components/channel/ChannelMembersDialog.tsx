'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { Member } from '@/lib/data/types'
import { cn } from '@/lib/utils'

/**
 * 채널 헤더의 참여자 버튼 + 모달. Slack 과 같은 자리다.
 * 목록은 열 때 가져온다 (채널마다 수십 명이라 미리 받아 둘 이유가 없다).
 * private 채널이면 백엔드가 비멤버에게 404 를 주므로 이 모달은 멤버에게만 열린다.
 */
export function ChannelMembersDialog({
  channelId,
  channelName,
  isPrivate,
}: {
  channelId: string
  channelName: string
  isPrivate: boolean
}) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 여는 순간 한 번만 가져온다. effect 대신 핸들러에서 부르는 이유는 effect 안의 setState 가
  // 연쇄 렌더를 만들기 때문이다 (react-hooks/set-state-in-effect).
  const open_ = async () => {
    setOpen(true)
    if (members !== null || error !== null) return
    try {
      const res = await fetch(`/api/archive/channels/${encodeURIComponent(channelId)}/members`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { members: Member[] }
      setMembers(body.members)
    } catch {
      setError('참여자를 불러오지 못했습니다.')
    }
  }

  const people = members?.filter((m) => !m.is_bot && !m.deleted) ?? []
  const rest = members?.filter((m) => m.is_bot || m.deleted) ?? []

  return (
    <>
      <button
        type="button"
        onClick={() => void open_()}
        className="inline-flex items-center gap-1 rounded-md border border-border-soft bg-surface px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-strong"
        aria-label="참여자 보기"
      >
        <PeopleIcon />
        참여자
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="border-b border-border-soft px-5 py-4">
            <DialogTitle className="text-[15px] font-bold text-text-strong">
              #{channelName} 참여자
              {members && (
                <span className="ml-2 text-xs font-normal text-text-muted tabular-nums">{members.length}명</span>
              )}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-text-muted">
              {isPrivate
                ? '비공개 채널입니다. 이 목록과 대화는 참여자에게만 보입니다.'
                : '공개 채널입니다. 지금 이 채널에 들어와 있는 사람입니다.'}
            </DialogDescription>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
            {error && <p className="px-3 py-6 text-center text-sm text-text-muted">{error}</p>}
            {!error && members === null && (
              <p className="px-3 py-6 text-center text-sm text-text-muted">불러오는 중…</p>
            )}
            {members?.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-text-muted">참여자 정보가 없습니다.</p>
            )}
            {[...people, ...rest].map((m) => (
              <MemberRow key={m.user_id} member={m} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MemberRow({ member }: { member: Member }) {
  const dimmed = member.is_bot || member.deleted
  return (
    <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 hover:bg-surface-hover">
      <Avatar className="h-7 w-7 shrink-0 rounded-md">
        {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
        <AvatarFallback className="rounded-md bg-border-soft text-[11px] text-text-strong">
          {member.name.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <span className={cn('min-w-0 flex-1 truncate text-sm', dimmed ? 'text-text-muted' : 'text-text-strong')}>
        {member.name}
      </span>
      {member.is_bot && <Tag>앱</Tag>}
      {member.deleted && <Tag>비활성</Tag>}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded border border-border-soft px-1.5 py-0.5 text-[10px] text-text-muted">
      {children}
    </span>
  )
}

function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
