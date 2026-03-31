import 'server-only'
import { adminDb } from '@/lib/firebase/admin'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  address: string
  role: 'customer' | 'admin'
  createdAt: Date
}

function docToUser(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid: (data.uid as string) || uid,
    email: (data.email as string) || '',
    displayName: (data.displayName as string) || '',
    address: (data.address as string) || '',
    role: (data.role as 'customer' | 'admin') || 'customer',
    createdAt: data.createdAt
      ? new Date((data.createdAt as { _seconds: number })._seconds * 1000)
      : new Date(),
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!adminDb) return null

  const doc = await adminDb.collection('users').doc(uid).get()
  if (!doc.exists) return null

  return docToUser(doc.id, doc.data()!)
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()

  return snapshot.docs.map((doc) => docToUser(doc.id, doc.data()))
}

export async function getUserCount(): Promise<number> {
  if (!adminDb) return 0

  const snapshot = await adminDb.collection('users').count().get()
  return snapshot.data().count
}
