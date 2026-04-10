import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = '914297093615-06o57idijbrb86vn16v757ks8u0j2gh3.apps.googleusercontent.com'

export async function GET(request: NextRequest) {
  // Use the actual request host — works for any domain (localhost, vercel, custom)
  const host = request.headers.get('host') || 'rootsnew.vercel.app'
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
