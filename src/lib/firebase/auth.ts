import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
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

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  const provider = new GoogleAuthProvider()

  // Try popup first, fall back to redirect if COOP blocks it
  try {
    const credential = await signInWithPopup(auth, provider)
    const idToken = await credential.user.getIdToken(true)
    return {
      idToken,
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName,
    }
  } catch (err: unknown) {
    const error = err as { code?: string }
    // If popup blocked by COOP or browser, use redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider)
      // This won't return — page redirects to Google
      throw new Error('redirect')
    }
    throw err
  }
}

/**
 * Check for Google redirect result on page load.
 * Call this in a useEffect to complete the redirect flow.
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
