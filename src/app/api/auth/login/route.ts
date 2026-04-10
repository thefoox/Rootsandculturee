import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/verify-token'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Mangler token.' }, { status: 400 })
    }

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
