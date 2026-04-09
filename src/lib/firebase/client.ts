import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Use own domain for authDomain — proxied via /__/auth rewrite in next.config.ts
  // This fixes signInWithPopup/Redirect on browsers blocking third-party storage
  // See: https://firebase.google.com/docs/auth/web/redirect-best-practices
  authDomain: typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function getApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
      console.warn('Firebase: Missing API key. Auth and data features are disabled.')
    }
    return null
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

const app = getApp()

export const db: Firestore | null = app ? getFirestore(app) : null
export const auth: Auth | null = app ? getAuth(app) : null
export const storage: FirebaseStorage | null = app ? getStorage(app) : null
