import 'server-only'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'
import type { GiftCard } from '@/types'

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

function mapGiftCard(doc: FirebaseFirestore.DocumentSnapshot): GiftCard {
  const data = doc.data()!
  return {
    id: doc.id,
    code: data.code,
    amount: data.amount,
    remainingBalance: data.remainingBalance,
    purchasedBy: data.purchasedBy ?? null,
    purchaserEmail: data.purchaserEmail,
    recipientName: data.recipientName,
    recipientEmail: data.recipientEmail,
    message: data.message || '',
    status: data.status,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    usedAt: data.usedAt?.toDate() ?? null,
    expiresAt: data.expiresAt?.toDate() ?? new Date(),
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
  if (!adminDb) return null

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
  if (!adminDb) return null
  const doc = await adminDb.collection('giftCards').doc(code).get()
  if (!doc.exists) return null
  return mapGiftCard(doc)
}

export async function getAllGiftCards(): Promise<GiftCard[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection('giftCards')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapGiftCard)
}

export async function validateGiftCard(
  code: string
): Promise<{ valid: true; balance: number } | { valid: false; error: string }> {
  if (!adminDb) return { valid: false, error: 'Systemet er ikke tilgjengelig.' }

  const doc = await adminDb.collection('giftCards').doc(code).get()
  if (!doc.exists) {
    return { valid: false, error: 'Ugyldig gavekort-kode.' }
  }

  const data = doc.data()!
  if (data.status === 'used') {
    return { valid: false, error: 'Gavekortet er allerede brukt opp.' }
  }
  if (data.status === 'expired' || (data.expiresAt && data.expiresAt.toDate() < new Date())) {
    return { valid: false, error: 'Gavekortet har utlopt.' }
  }
  if (data.remainingBalance <= 0) {
    return { valid: false, error: 'Gavekortet har ingen gjenstaaende saldo.' }
  }

  return { valid: true, balance: data.remainingBalance }
}

export async function redeemGiftCard(
  code: string,
  amount: number
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
  if (!adminDb) return { success: false, error: 'Systemet er ikke tilgjengelig.' }

  const docRef = adminDb.collection('giftCards').doc(code)

  return adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef)
    if (!doc.exists) {
      return { success: false as const, error: 'Ugyldig gavekort-kode.' }
    }

    const data = doc.data()!
    if (data.status !== 'active') {
      return { success: false as const, error: 'Gavekortet er ikke aktivt.' }
    }
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return { success: false as const, error: 'Gavekortet har utlopt.' }
    }

    const currentBalance = data.remainingBalance
    if (currentBalance <= 0) {
      return { success: false as const, error: 'Gavekortet har ingen saldo.' }
    }

    const deduction = Math.min(amount, currentBalance)
    const newBalance = currentBalance - deduction
    const newStatus = newBalance <= 0 ? 'used' : 'active'

    transaction.update(docRef, {
      remainingBalance: newBalance,
      status: newStatus,
      usedAt: newBalance <= 0 ? new Date() : null,
    })

    return { success: true as const, newBalance }
  })
}

export async function deactivateGiftCard(code: string): Promise<boolean> {
  if (!adminDb) return false
  const docRef = adminDb.collection('giftCards').doc(code)
  const doc = await docRef.get()
  if (!doc.exists) return false

  await docRef.update({ status: 'expired' })
  return true
}
