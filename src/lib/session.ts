import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload } from '@/types'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
const COOKIE_NAME = '__session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = Date.now() + SESSION_DURATION
  const session = await new SignJWT({ ...payload, expiresAt } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(encodedKey)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  if (!cookie?.value) return null

  try {
    const { payload } = await jwtVerify(cookie.value, encodedKey, {
      algorithms: ['HS256'],
    })
    const session = payload as unknown as SessionPayload
    if (session.expiresAt < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
