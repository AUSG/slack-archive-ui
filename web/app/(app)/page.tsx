import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'

export default async function AppHomePage() {
  const supabase = await createClient()

  const { data: firstChannel } = await supabase
    .from('channel')
    .select('id')
    .not('name', 'ilike', HIDDEN_NAME_LIKE)
    .not('name', 'imatch', HIDDEN_NAME_REGEX)
    .order('name')
    .limit(1)
    .maybeSingle()

  if (firstChannel) {
    redirect(`/c/${firstChannel.id}`)
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
      채널이 없습니다.
    </div>
  )
}
