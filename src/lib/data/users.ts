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

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!adminDb) return null

  const doc = await adminDb.collection('users').doc(uid).get()
  if (!doc.exists) return null

  const data = doc.data()!
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
