/**
 * src/proxy.ts — Next.js 16 proxy (replaces middleware.ts)
 *
 * Runs on the Edge Runtime before matched API routes.
 * Applies in-memory rate limiting to auth and upload endpoints.
 *
 * CAVEAT: The in-memory Map resets on Vercel Edge cold starts (stateless
 * per-process). This is acceptable for abuse prevention, but NOT for strict
 * quota enforcement. For distributed rate limiting, upgrade to Upstash Redis
 * with @upstash/ratelimit.
 */
import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Rate limit configuration
// Key: route pathname, Value: [maxRequests, windowMs]
// ---------------------------------------------------------------------------
const RATE_LIMITS: Record<string, [number, number]> = {
  '/api/auth/login': [10, 60_000],     // 10 requests per minute
  '/api/auth/google': [10, 60_000],    // 10 requests per minute
  '/api/auth/session': [30, 60_000],   // 30 requests per minute (client polling)
  '/api/upload': [20, 3_600_000],      // 20 requests per hour
}

// ---------------------------------------------------------------------------
// In-memory rate limit store
// CAVEAT: Resets on Vercel Edge cold starts — see file header.
// ---------------------------------------------------------------------------
type RateEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateEntry>()

/**
 * Check and update the rate limit for a given IP + bucket combination.
 * Returns true if the request is rate-limited (should be blocked).
 */
function checkRateLimit(
  ip: string,
  bucket: string,
  max: number,
  windowMs: number
): { limited: boolean; resetAt: number } {
  const key = `${ip}:${bucket}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    // Fresh window — reset counter
    const newEntry: RateEntry = { count: 1, resetAt: now + windowMs }
    rateLimitStore.set(key, newEntry)
    return { limited: false, resetAt: newEntry.resetAt }
  }

  if (entry.count >= max) {
    return { limited: true, resetAt: entry.resetAt }
  }

  entry.count++
  return { limited: false, resetAt: entry.resetAt }
}

// ---------------------------------------------------------------------------
// Proxy function (Next.js 16 — replaces `middleware` export)
// ---------------------------------------------------------------------------
export function proxy(request: NextRequest): NextResponse | Response {
  const pathname = request.nextUrl.pathname
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  // Request logging
  console.log(`[proxy] ${request.method} ${pathname} ip=${ip}`)

  // Rate limiting
  const limitConfig = RATE_LIMITS[pathname]
  if (limitConfig) {
    const [max, windowMs] = limitConfig
    const { limited, resetAt } = checkRateLimit(ip, pathname, max, windowMs)

    if (limited) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'For mange forsøk. Prøv igjen senere.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
          },
        }
      )
    }
  }

  return NextResponse.next()
}

// ---------------------------------------------------------------------------
// Matcher — proxy only intercepts these paths (avoids running on all routes)
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    '/api/auth/login',
    '/api/auth/google',
    '/api/auth/session',
    '/api/upload',
  ],
}
