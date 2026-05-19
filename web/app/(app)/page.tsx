import { createClient } from '@/lib/supabase/server'
import { HomeHero } from '@/components/workspace/HomeHero'
import {
  HIDDEN_NAME_LIKE,
  HIDDEN_NAME_REGEX,
} from '@/lib/data/channel-filter'

export default async function AppHomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('channel')
    .select('id, name, msg_count')
    .not('name', 'ilike', HIDDEN_NAME_LIKE)
    .not('name', 'imatch', HIDDEN_NAME_REGEX)
    .order('msg_count', { ascending: false, nullsFirst: false })
    .limit(5)

  return <HomeHero topChannels={data ?? []} />
}
