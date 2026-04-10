import 'server-only'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'
import type { GiftCard } from '@/types'
import type { FirestoreDoc, DocRef } from '@/lib/firebase/firestore-rest'

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excludes ambiguous chars (0/O, 1/I)
  let part1 = ''
  let part2 = ''
  const bytes = crypto.randomBytes(8)
  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length]
    part2 += chars[bytes[i + 4] % chars.length]
  }
  return `RC-${part1}-${part2}`
}

function mapGiftCard(doc: FirestoreDoc): GiftCard {
  const data = doc.data()
  return {
    id: doc.id,
    code: data.code as string,
    amount: data.amount as number,
    remainingBalance: data.remainingBalance as number,
    purchasedBy: (data.purchasedBy as string) ?? null,
    purchaserEmail: data.purchaserEmail as string,
    recipientName: data.recipientName as string,
    recipientEmail: data.recipientEmail as string,
    message: (data.message as string) || '',
    status: data.status as GiftCard['status'],
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    usedAt: data.usedAt instanceof Date ? data.usedAt : null,
    expiresAt: data.expiresAt instanceof Date ? data.expiresAt : new Date(),
  }
}

export async function createGiftCard(params: {
  amount: number
  purchasedBy: string | null
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message: string
}): Promise<GiftCard | null> {
  // Generate unique code with retry
  let code = generateGiftCardCode()
  let attempts = 0
  while (attempts < 5) {
    const existing = await adminDb.collection('giftCards').doc(code).get()
    if (!existing.exists) break
    code = generateGiftCardCode()
    attempts++
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const giftCardData = {
    code,
    amount: params.amount,
    remainingBalance: params.amount,
    purchasedBy: params.purchasedBy,
    purchaserEmail: params.purchaserEmail,
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    message: params.message,
    status: 'active' as const,
    createdAt: now,
    usedAt: null,
    expiresAt,
  }

  await adminDb.collection('giftCards').doc(code).set(giftCardData)

  return { id: code, ...giftCardData }
}

export async function getGiftCardByCode(code: string): Promise<GiftCard | null> {
  const doc = await adminDb.collection('giftCards').doc(code).get()
  if (!doc.exists) return null
  return mapGiftCard(doc)
}

export async function getAllGiftCards(): Promise<GiftCard[]> {
  const snapshot = await adminDb
    .collection('giftCards')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapGiftCard)
}

export async function validateGiftCard(
  code: string
): Promise<{ valid: true; balance: number } | { valid: false; error: string }> {
  const doc = await adminDb.collection('giftCards').doc(code).get()
  if (!doc.exists) {
    return { valid: false, error: 'Ugyldig gavekort-kode.' }
  }

  const data = doc.data()
  if (data.status === 'used') {
    return { valid: false, error: 'Gavekortet er allerede brukt opp.' }
  }
  const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : null
  if (data.status === 'expired' || (expiresAt && expiresAt < new Date())) {
    return { valid: false, error: 'Gavekortet har utlopt.' }
  }
  if ((data.remainingBalance as number) <= 0) {
    return { valid: false, error: 'Gavekortet har ingen gjenstaaende saldo.' }
  }

  return { valid: true, balance: data.remainingBalance as number }
}

export async function redeemGiftCard(
  code: string,
  amount: number
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
  const docRef = adminDb.collection('giftCards').doc(code) as unknown as DocRef

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(docRef)
    if (!doc.exists) {
      return { success: false as const, error: 'Ugyldig gavekort-kode.' }
    }

    const data = doc.data()
    if (data.status !== 'active') {
      return { success: false as const, error: 'Gavekortet er ikke aktivt.' }
    }
    const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : null
    if (expiresAt && expiresAt < new Date()) {
      return { success: false as const, error: 'Gavekortet har utlopt.' }
    }

    const currentBalance = data.remainingBalance as number
    if (currentBalance <= 0) {
      return { success: false as const, error: 'Gavekortet har ingen saldo.' }
    }

    const deduction = Math.min(amount, currentBalance)
    const newBalance = currentBalance - deduction
    const newStatus = newBalance <= 0 ? 'used' : 'active'

    tx.update(docRef, {
      remainingBalance: newBalance,
      status: newStatus,
      usedAt: newBalance <= 0 ? new Date() : null,
    })

    return { success: true as const, newBalance }
  })
}

export async function deactivateGiftCard(code: string): Promise<boolean> {
  const doc = await adminDb.collection('giftCards').doc(code).get()
  if (!doc.exists) return false

  await adminDb.collection('giftCards').doc(code).update({ status: 'expired' })
  return true
}
