import { HomeHero } from '@/components/workspace/HomeHero'
import { getChannels } from '@/lib/api/archive'
import { toChannel } from '@/lib/data/adapt'

export default async function AppHomePage() {
  const channels = await getChannels()
  const top = [...channels]
    .sort((a, b) => b.message_count - a.message_count)
    .slice(0, 5)
    .map(toChannel)
  return <HomeHero topChannels={top} />
}
