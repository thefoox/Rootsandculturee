import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = '914297093615-06o57idijbrb86vn16v757ks8u0j2gh3.apps.googleusercontent.com'

/**
 * Allowed hosts for redirect_uri construction.
 * Defense-in-depth: Google also validates redirect_uri, but we validate Host on our side.
 * VERCEL_URL is set automatically on Vercel preview/production deployments.
 */
const ALLOWED_HOSTS = [
  'rootsnew.vercel.app',
  'localhost:3000',
  process.env.VERCEL_URL,           // e.g. "my-app-abc123.vercel.app" (preview deploys)
  process.env.NEXT_PUBLIC_BASE_DOMAIN, // custom domain if set
].filter(Boolean) as string[]

export async function GET(request: NextRequest) {
  // Validate Host header against allowlist before constructing redirect_uri
  const host = request.headers.get('host') || ''
  if (!ALLOWED_HOSTS.includes(host)) {
    return NextResponse.json(
      { error: 'Ugyldig foresporsel.' },
      { status: 400 }
    )
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const callbackUrl = `${protocol}://${host}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
