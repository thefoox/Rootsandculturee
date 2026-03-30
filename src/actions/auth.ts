'use server'

import { adminAuth } from '@/lib/firebase/admin'
import { adminDb } from '@/lib/firebase/admin'
import { createSession, deleteSession } from '@/lib/session'
import type { AuthResult } from '@/types'

export async function loginAction(idToken: string): Promise<AuthResult> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Get user role from custom claims
    const role = decoded.admin === true ? 'admin' : 'customer'

    await createSession({
      uid: decoded.uid,
      email: decoded.email || '',
      role,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Feil e-post eller passord. Prover du igjen?' }
  }
}

export async function registerAction(
  idToken: string,
  displayName: string,
  address: string
): Promise<AuthResult> {
  try {
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

    return { success: true }
  } catch {
    return { success: false, error: 'Noe gikk galt. Sjekk internettforbindelsen og prov pa nytt.' }
  }
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
}
