'use server'

import { adminAuth } from '@/lib/firebase/admin'
import { adminDb } from '@/lib/firebase/admin'
import { createSession, deleteSession } from '@/lib/session'
import { subscribeNewsletter } from '@/lib/email/contacts'
import type { AuthResult } from '@/types'

export async function loginAction(idToken: string): Promise<AuthResult> {
  try {
    if (!adminAuth) {
      return { success: false, error: 'Server er ikke konfigurert. Kontakt administrator.' }
    }
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Get user role from custom claims
    const role = decoded.admin === true ? 'admin' : 'customer'

    await createSession({
      uid: decoded.uid,
      email: decoded.email || '',
      role,
    })

    return { success: true }
  } catch (error) {
    console.error('loginAction failed:', error)
    return { success: false, error: 'Feil e-post eller passord. Prover du igjen?' }
  }
}

export async function registerAction(
  idToken: string,
  displayName: string,
  address: string,
  newsletterConsent?: boolean
): Promise<AuthResult> {
  try {
    if (!adminAuth || !adminDb) {
      return { success: false, error: 'Server er ikke konfigurert. Kontakt administrator.' }
    }
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Create user document in Firestore
    await adminDb.collection('users').doc(decoded.uid).set({
      uid: decoded.uid,
      email: decoded.email || '',
      displayName,
      address,
      role: 'customer',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })

    await createSession({
      uid: decoded.uid,
      email: decoded.email || '',
      role: 'customer',
    })

    if (newsletterConsent && decoded.email) {
      try {
        await subscribeNewsletter(decoded.email)
      } catch {
        // Newsletter signup failure should not block registration
      }
    }

    return { success: true }
  } catch (error) {
    console.error('registerAction failed:', error)
    return { success: false, error: 'Noe gikk galt. Sjekk internettforbindelsen og prøv på nytt.' }
  }
}

export async function googleLoginAction(idToken: string): Promise<AuthResult> {
  try {
    if (!adminAuth || !adminDb) {
      return { success: false, error: 'Server er ikke konfigurert. Kontakt administrator.' }
    }
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Check if user doc exists in Firestore
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()

    if (!userDoc.exists) {
      // First-time Google login: create user document
      await adminDb.collection('users').doc(decoded.uid).set({
        uid: decoded.uid,
        email: decoded.email || '',
        displayName: decoded.name || '',
        address: '',
        role: 'customer',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      })
    } else {
      // Returning user: update lastLoginAt
      await adminDb.collection('users').doc(decoded.uid).update({
        lastLoginAt: new Date(),
      })
    }

    // Get user role from custom claims
    const role = decoded.admin === true ? 'admin' : 'customer'

    await createSession({
      uid: decoded.uid,
      email: decoded.email || '',
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
