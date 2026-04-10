import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  address: string
  role: 'customer' | 'admin'
  createdAt: Date
}

function docToUser(uid: string, doc: FirestoreDoc): UserProfile {
  const data = doc.data()
  return {
    uid: (data.uid as string) || uid,
    email: (data.email as string) || '',
    displayName: (data.displayName as string) || '',
    address: (data.address as string) || '',
    role: (data.role as 'customer' | 'admin') || 'customer',
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await adminDb.collection('users').doc(uid).get()
  if (!doc.exists) return null
  return docToUser(doc.id, doc)
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await adminDb
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()
  return snapshot.docs.map((doc) => docToUser(doc.id, doc))
}

export async function getUserCount(): Promise<number> {
  const result = await adminDb.collection('users').count()
  return result.data().count
}
