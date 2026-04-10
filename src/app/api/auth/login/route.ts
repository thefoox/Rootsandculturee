import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/verify-token'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Mangler token.' }, { status: 400 })
    }

    // Debug: decode JWT to check issuer/audience mismatch
    const parts = idToken.split('.')
    const jwtPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    const debugInfo = {
      tokenIssuer: jwtPayload.iss,
      tokenAudience: jwtPayload.aud,
      serverProjectId: process.env.FIREBASE_PROJECT_ID,
      expectedIssuer: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`,
      match: jwtPayload.iss === `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}` && jwtPayload.aud === process.env.FIREBASE_PROJECT_ID,
    }

    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Ugyldig innlogging. Prøv igjen.', _debug: debugInfo })
    }

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.admin === true ? 'admin' : 'customer',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login API failed:', error)
    return NextResponse.json({ success: false, error: 'Noe gikk galt. Prøv igjen.' })
  }
}
