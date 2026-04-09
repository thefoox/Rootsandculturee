import 'server-only'
import { createPrivateKey } from 'crypto'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

/**
 * Convert any PEM private key to PKCS#8 format.
 * Node 20+ (OpenSSL 3.0) rejects PKCS#1 keys (`BEGIN RSA PRIVATE KEY`).
 * This normalizes to PKCS#8 (`BEGIN PRIVATE KEY`) which works on all versions.
 */
function normalizePem(raw: string): string {
  const pem = raw.replace(/\\n/g, '\n')
  try {
    const key = createPrivateKey(pem)
    return key.export({ type: 'pkcs8', format: 'pem' }) as string
  } catch {
    // If conversion fails, return as-is and let Firebase handle it
    return pem
  }
}

function getApp() {
  if (getApps().length > 0) return getApps()[0]

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      'Firebase Admin: Missing credentials. Data access will return empty results during build.'
    )
    return null
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizePem(privateKey),
      }),
    })
  } catch (error) {
    console.warn('Firebase Admin: Failed to initialize. Data access will return empty results during build.', error)
    return null
  }
}

const app = getApp()

export const adminDb = app ? getFirestore(app) : null
export const adminAuth = app ? getAuth(app) : null
export const adminApp = app
