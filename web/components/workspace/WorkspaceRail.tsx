import Link from 'next/link'
import Image from 'next/image'
import { UserMenu } from './UserMenu'
import { QuickSwitcherTrigger } from './QuickSwitcherTrigger'

export function WorkspaceRail({
  displayName,
  avatarUrl,
  email,
}: {
  displayName: string
  avatarUrl: string | null
  email?: string | null
}) {
  return (
    <aside
      aria-label="워크스페이스"
      className="flex h-full w-16 shrink-0 flex-col items-center justify-between border-r border-sidebar-border-soft bg-sidebar-base py-3"
    >
      <Link
        href="/"
        aria-label="AUSG 홈"
        className="block transition-opacity hover:opacity-80"
      >
        <Image
          src="/logo.svg"
          alt="AUSG"
          width={40}
          height={40}
          priority
          className="h-10 w-10 rounded-md"
        />
      </Link>

      <div className="flex flex-col items-center gap-1">
        <QuickSwitcherTrigger />
        <UserMenu displayName={displayName} avatarUrl={avatarUrl} email={email} />
      </div>
    </aside>
  )
}
