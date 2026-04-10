import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = '914297093615-06o57idijbrb86vn16v757ks8u0j2gh3.apps.googleusercontent.com'

function getCallbackUrl() {
  const base = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  return `${base}/api/auth/google/callback`
}

export async function GET() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
