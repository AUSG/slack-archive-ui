import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TEAM = process.env.NEXT_PUBLIC_SLACK_TEAM_ID!

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam)}`,
    )
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('exchangeCodeForSession failed', error)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Slack OIDC는 team_id를 user_metadata.custom_claims 안에 둠
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const teamId = user?.user_metadata?.custom_claims?.['https://slack.com/team_id']

  if (teamId !== ALLOWED_TEAM) {
    console.warn('team mismatch', { got: teamId, expected: ALLOWED_TEAM })
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=wrong_workspace`)
  }

  return NextResponse.redirect(`${origin}/`)
}
