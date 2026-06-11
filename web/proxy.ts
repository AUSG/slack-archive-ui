import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/auth']

function shouldLogAccess(request: NextRequest): boolean {
  const { pathname } = request.nextUrl
  const isTarget = pathname.startsWith('/c/') || pathname === '/search'
  if (!isTarget) return false

  if (request.headers.get('next-router-prefetch') === '1') return false
  const purpose =
    request.headers.get('purpose') ?? request.headers.get('sec-purpose') ?? ''
  if (purpose.includes('prefetch')) return false

  return true
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && shouldLogAccess(request)) {
    const query = request.nextUrl.search.replace(/^\?/, '')
    await supabase
      .from('access_logs')
      .insert({
        user_id: user.id,
        email: user.email ?? null,
        path: pathname,
        query: query || null,
      })
      .then(undefined, () => {})
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
