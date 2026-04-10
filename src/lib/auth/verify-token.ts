import 'server-only'
import { createLocalJWKSet, jwtVerify, type JSONWebKeySet } from 'jose'

/**
 * Verify Firebase ID token WITHOUT firebase-admin.
 * Fetches Google's public JWKS with in-memory caching + stale fallback.
 * This works on Vercel serverless where firebase-admin fails to load.
 */

const JWKS_URL = 'https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com'
const FIREBASE_PROJECT_ID = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim()

let cachedJWKS: ReturnType<typeof createLocalJWKSet> | null = null
let cacheExpiry = 0

async function getJWKS() {
  if (cachedJWKS && Date.now() < cacheExpiry) {
    return cachedJWKS
  }

  try {
    const res = await fetch(JWKS_URL)
    if (!res.ok) throw new Error(`JWKS fetch ${res.status}`)
    const jwks: JSONWebKeySet = await res.json()
    cachedJWKS = createLocalJWKSet(jwks)
    cacheExpiry = Date.now() + 3600_000 // 1 hour
    return cachedJWKS
  } catch (error) {
    console.error('JWKS fetch failed:', error instanceof Error ? error.message : error)
    if (cachedJWKS) return cachedJWKS // use stale cache
    throw error
  }
}

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
    const jwks = await getJWKS()
    const { payload } = await jwtVerify(idToken, jwks, {
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
    console.error('verifyFirebaseToken failed:', error instanceof Error ? error.message : error)
    return null
  }
}
