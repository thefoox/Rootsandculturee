import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/verify-token'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Mangler token.' }, { status: 400 })
    }

    // Debug: decode JWT header+payload without verification to see what we're working with
    const parts = idToken.split('.')
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    console.error('LOGIN DEBUG — token issuer:', payload.iss, 'audience:', payload.aud, 'alg:', header.alg, 'kid:', header.kid, 'projectId:', process.env.FIREBASE_PROJECT_ID)

    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Ugyldig innlogging. Prøv igjen.' })
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
