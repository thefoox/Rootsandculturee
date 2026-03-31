import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from './client'

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase er ikke konfigurert. Legg til miljøvariabler.')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await credential.user.getIdToken()
  return { idToken, uid: credential.user.uid }
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
