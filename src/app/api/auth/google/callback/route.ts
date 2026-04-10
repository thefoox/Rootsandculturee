import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

const GOOGLE_CLIENT_ID = '914297093615-06o57idijbrb86vn16v757ks8u0j2gh3.apps.googleusercontent.com'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'rootsnew.vercel.app'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const callbackUrl = `${baseUrl}/api/auth/google/callback`

  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=cancelled`)
  }

  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientSecret) {
    console.error('GOOGLE_OAUTH_CLIENT_SECRET not configured')
    return NextResponse.redirect(`${baseUrl}/?auth_error=config`)
  }

  try {
    // 1. Exchange auth code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text()
      console.error('Token exchange failed:', err)
      return NextResponse.redirect(`${baseUrl}/?auth_error=token`)
    }

    const tokens = await tokenResponse.json()

    // 2. Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error('User info fetch failed')
      return NextResponse.redirect(`${baseUrl}/?auth_error=userinfo`)
    }

    const userInfo = await userInfoResponse.json()

    // 3. Determine role
    // Fallback: check env var ADMIN_EMAILS (comma-separated) since firebase-admin may not load on Vercel
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    let role: 'admin' | 'customer' = adminEmails.includes(userInfo.email?.toLowerCase()) ? 'admin' : 'customer'

    try {
      const { adminDb, adminAuth } = await import('@/lib/firebase/admin')

      // Try to get role from Firebase Custom Claims via Admin Auth
      if (adminAuth) {
        try {
          const firebaseUser = await adminAuth.getUserByEmail(userInfo.email)
          if (firebaseUser.customClaims?.admin === true) {
            role = 'admin'
          }
        } catch {
          // User may not exist in Firebase Auth (Google OAuth only)
        }
      }

      // Create/update user doc in Firestore
      if (adminDb) {
        const userDoc = await adminDb.collection('users').doc(userInfo.sub).get()
        if (!userDoc.exists) {
          await adminDb.collection('users').doc(userInfo.sub).set({
            uid: userInfo.sub,
            email: userInfo.email || '',
            displayName: userInfo.name || '',
            address: '',
            role,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          })
        } else {
          // Use role from existing doc if available
          const existingRole = userDoc.data()?.role
          if (existingRole === 'admin') role = 'admin'
          await adminDb.collection('users').doc(userInfo.sub).update({
            lastLoginAt: new Date(),
          })
        }
      }
    } catch {
      // firebase-admin not available — role stays 'customer'
    }

    // 4. Create session cookie
    await createSession({
      uid: userInfo.sub,
      email: userInfo.email || '',
      role,
    })

    // 5. Redirect to homepage (logged in)
    return NextResponse.redirect(baseUrl)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/?auth_error=unknown`)
  }
}
