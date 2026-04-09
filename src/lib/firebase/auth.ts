import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'
import { auth } from './client'

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await credential.user.getIdToken()
  return { idToken, uid: credential.user.uid }
}

/**
 * Start Google sign-in via full-page redirect.
 * No popup, no iframe — avoids all COOP/CSP/X-Frame-Options issues.
 */
export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase er ikke konfigurert.')
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
}

/**
 * Check for redirect result. Call on every page load.
 */
export async function getGoogleRedirectResult() {
  if (!auth) return null
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null
    const idToken = await result.user.getIdToken(true)
    return { idToken, uid: result.user.uid, email: result.user.email, displayName: result.user.displayName }
  } catch {
    return null
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  const idToken = await credential.user.getIdToken()
  return { idToken, uid: credential.user.uid }
}

export async function signOut() {
  if (!auth) return
  await firebaseSignOut(auth)
}

export async function resetPassword(email: string) {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  await sendPasswordResetEmail(auth, email)
}
