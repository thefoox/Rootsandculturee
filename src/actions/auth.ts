'use server'

import { verifyFirebaseToken } from '@/lib/auth/verify-token'
import { createSession, deleteSession } from '@/lib/session'
import type { AuthResult } from '@/types'

// ZERO firebase-admin imports here — it crashes Vercel serverless runtime.
// Firestore user docs are handled in /api/auth/google/callback instead.

export async function loginAction(idToken: string): Promise<AuthResult> {
  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return { success: false, error: 'Ugyldig innlogging. Prøv igjen.' }
    }

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.admin === true ? 'admin' : 'customer',
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
  newsletterConsent?: boolean,
): Promise<AuthResult> {
  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      return { success: false, error: 'Ugyldig registrering. Prøv igjen.' }
    }

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role: 'customer',
    })

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

    await createSession({
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.admin === true ? 'admin' : 'customer',
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
