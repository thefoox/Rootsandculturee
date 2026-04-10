'use server'

import { verifyFirebaseToken } from '@/lib/auth/verify-token'
import { createSession, deleteSession } from '@/lib/session'
import { subscribeNewsletter } from '@/lib/email/contacts'
import type { AuthResult } from '@/types'

// Optional: firebase-admin for Firestore user docs (may fail on Vercel)
let adminDb: FirebaseFirestore.Firestore | null = null
try {
  const admin = await import('@/lib/firebase/admin')
  adminDb = admin.adminDb
} catch {
  // firebase-admin not available — auth still works, just no user docs
}

export async function loginAction(idToken: string): Promise<AuthResult> {
  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return { success: false, error: 'Ugyldig innlogging. Prøv igjen.' }
    }

    const role = decoded.admin === true ? 'admin' : 'customer'

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role,
    })

    return { success: true }
  } catch (error) {
    console.error('loginAction failed:', error)
    return { success: false, error: 'Noe gikk galt. Prøv igjen.' }
  }
}

export async function registerAction(
  idToken: string,
  displayName: string,
  address: string,
  newsletterConsent?: boolean
): Promise<AuthResult> {
  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return { success: false, error: 'Ugyldig registrering. Prøv igjen.' }
    }

    // Create user document in Firestore (optional — may fail if firebase-admin unavailable)
    if (adminDb) {
      try {
        await adminDb.collection('users').doc(decoded.uid).set({
          uid: decoded.uid,
          email: decoded.email,
          displayName,
          address,
          role: 'customer',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        })
      } catch (e) {
        console.warn('Failed to create user doc (non-blocking):', e)
      }
    }

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role: 'customer',
    })

    if (newsletterConsent && decoded.email) {
      try {
        await subscribeNewsletter(decoded.email)
      } catch {
        // Newsletter failure should not block registration
      }
    }

    return { success: true }
  } catch (error) {
    console.error('registerAction failed:', error)
    return { success: false, error: 'Noe gikk galt. Prøv igjen.' }
  }
}

export async function googleLoginAction(idToken: string): Promise<AuthResult> {
  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return { success: false, error: 'Ugyldig Google-innlogging. Prøv igjen.' }
    }

    // Create/update user doc in Firestore (optional — may fail if firebase-admin unavailable)
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
        if (!userDoc.exists) {
          await adminDb.collection('users').doc(decoded.uid).set({
            uid: decoded.uid,
            email: decoded.email,
            displayName: decoded.name || '',
            address: '',
            role: 'customer',
            createdAt: new Date(),
            lastLoginAt: new Date(),
          })
        } else {
          await adminDb.collection('users').doc(decoded.uid).update({
            lastLoginAt: new Date(),
          })
        }
      } catch (e) {
        console.warn('Failed to update user doc (non-blocking):', e)
      }
    }

    const role = decoded.admin === true ? 'admin' : 'customer'

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role,
    })

    return { success: true }
  } catch (error) {
    console.error('googleLoginAction failed:', error)
    return { success: false, error: 'Innlogging med Google feilet. Prøv igjen.' }
  }
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
}
