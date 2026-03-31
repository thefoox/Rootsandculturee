import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = '__session'
const SECRET = process.env.SESSION_SECRET || 'dev-secret-for-mock-login-only'
const encodedKey = new TextEncoder().encode(SECRET)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') === 'admin' ? 'admin' : 'customer'

  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
  const token = await new SignJWT({
    uid: 'mock-user-1',
    email: 'demo@rootsculture.no',
    role,
    expiresAt,
  } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(encodedKey)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })

  const redirectTo = role === 'admin' ? '/admin' : '/konto'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
