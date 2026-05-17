import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppHomePage() {
  const supabase = await createClient()

  const { data: firstChannel } = await supabase
    .from('channel')
    .select('id')
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
