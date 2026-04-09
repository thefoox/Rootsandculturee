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
 * Start Google sign-in via redirect (not popup).
 * Popup is blocked by Cross-Origin-Opener-Policy on Vercel.
 * After Google auth, user is redirected back — call checkGoogleRedirectResult() on mount.
 */
export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
  // Page redirects to Google — this function never returns
}

/**
 * Check for Google redirect result on page load.
 * Returns the user's idToken if they just completed a Google sign-in redirect.
 */
export async function checkGoogleRedirectResult() {
  if (!auth) return null
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null
    const idToken = await result.user.getIdToken(true)
    return {
      idToken,
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
    }
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
