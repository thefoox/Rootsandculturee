import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { initializeFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

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
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.warn('Firebase Admin: Failed to initialize.', error)
    return null
  }
}

const app = getApp()

// Use REST instead of gRPC — fixes "DECODER routines::unsupported" on Vercel/serverless
// gRPC metadata plugin fails to parse service account keys on certain Node/OpenSSL combos
// initializeFirestore with preferRest bypasses gRPC entirely (firebase-admin docs recommended)
export const adminDb = app ? initializeFirestore(app, { preferRest: true }) : null
export const adminAuth = app ? getAuth(app) : null
export const adminApp = app
