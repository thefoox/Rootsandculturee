import 'server-only'
import { createRemoteJWKSet, jwtVerify } from 'jose'

/**
 * Verify Firebase ID token WITHOUT firebase-admin.
 * Uses Google's public JWKS endpoint to verify the JWT signature.
 * This works on Vercel serverless where firebase-admin fails to load.
 */

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_account/v1/jwk/securetoken@system.gserviceaccount.com')
)

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

interface DecodedToken {
  uid: string
  email: string
  name?: string
  admin?: boolean
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedToken | null> {
  if (!FIREBASE_PROJECT_ID) {
    console.error('verifyFirebaseToken: No FIREBASE_PROJECT_ID configured')
    return null
  }

  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    })

    const uid = payload.sub
    if (!uid) return null

    return {
      uid,
      email: (payload.email as string) || '',
      name: (payload.name as string) || undefined,
      admin: (payload.admin as boolean) || undefined,
    }
  } catch (error) {
    console.error('verifyFirebaseToken failed:', error)
    return null
  }
}
