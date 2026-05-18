const TEAM_ID = process.env.NEXT_PUBLIC_SLACK_TEAM_ID

export function slackMessageUrl(channelId: string, messageTs: string): string {
  if (!TEAM_ID) return '#'
  return `slack://channel?team=${TEAM_ID}&id=${channelId}&message=${messageTs}`
}

export function slackChannelUrl(channelId: string): string {
  if (!TEAM_ID) return '#'
  return `slack://channel?team=${TEAM_ID}&id=${channelId}`
}
