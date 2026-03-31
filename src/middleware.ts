import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || 'dev-secret-for-mock-login-only'
const encodedKey = new TextEncoder().encode(secretKey)
const COOKIE_NAME = '__session'

async function getSessionFromCookie(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie?.value) return null

  try {
    const { payload } = await jwtVerify(cookie.value, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as { uid: string; email: string; role: string; expiresAt: number }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes -- require admin role
  if (pathname.startsWith('/admin')) {
    const session = await getSessionFromCookie(request)
    if (!session || session.role !== 'admin') {
      // Redirect to home (not login -- prevents admin path enumeration)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Customer routes -- require any authenticated user
  if (pathname.startsWith('/konto')) {
    const session = await getSessionFromCookie(request)
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/konto/:path*'],
}
