import 'server-only'
import { writeFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app'
import { initializeFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

/**
 * Write a temporary service account JSON file and set GOOGLE_APPLICATION_CREDENTIALS.
 * This bypasses cert() which fails on Vercel Node 24 with ERR_OSSL_UNSUPPORTED.
 * applicationDefault() uses google-auth-library's built-in key handling which works.
 */
function setupCredentials(): boolean {
  // If GOOGLE_APPLICATION_CREDENTIALS already set, use it
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return true
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin: Missing credentials.')
    return false
  }

  try {
    const keyFile = join(tmpdir(), 'firebase-service-account.json')
    writeFileSync(keyFile, JSON.stringify({
      type: 'service_account',
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
      token_uri: 'https://oauth2.googleapis.com/token',
    }))
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFile
    return true
  } catch (error) {
    console.warn('Firebase Admin: Failed to write credentials file.', error)
    return false
  }
}

function getApp() {
  if (getApps().length > 0) return getApps()[0]
  if (!setupCredentials()) return null

  try {
    return initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
    })
  } catch (error) {
    console.warn('Firebase Admin: Failed to initialize.', error)
    return null
  }
}

const app = getApp()

// REST transport — avoids gRPC issues on serverless (firebase-admin docs recommended)
export const adminDb = app ? initializeFirestore(app, { preferRest: true }) : null
export const adminAuth = app ? getAuth(app) : null
export const adminApp = app
