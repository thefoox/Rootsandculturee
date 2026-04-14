import { headers } from 'next/headers'

type RateEntry = { count: number; resetAt: number }
const store = new Map<string, RateEntry>()

/**
 * In-memory rate limiter for Server Actions.
 * Uses headers() to extract client IP.
 *
 * CAVEAT: In-memory Map resets on serverless cold starts.
 * Acceptable for abuse prevention, not strict enforcement.
 * Upgrade path: Upstash Redis + @upstash/ratelimit.
 *
 * @returns true if rate limited (caller should return error), false if OK
 */
export async function checkActionRateLimit(
  bucket: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerStore.get('x-real-ip') ??
    'unknown'

  const key = `${ip}:${bucket}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}
