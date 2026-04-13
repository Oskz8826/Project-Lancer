import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/quote', '/history', '/settings']
const AUTH_PAGES = ['/login', '/onboarding']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PocketBase stores auth in localStorage (client-side only).
  // For SSR route protection we check the pb_auth cookie that the SDK sets.
  const pbAuth = request.cookies.get('pb_auth')?.value
  let isAuthed = false

  if (pbAuth) {
    try {
      const parsed = JSON.parse(pbAuth)
      isAuthed = !!parsed?.token
    } catch {
      isAuthed = false
    }
  }

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  if (isProtected && !isAuthed) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
