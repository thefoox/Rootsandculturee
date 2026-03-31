'use server'

import { z } from 'zod'
import { validateGiftCard } from '@/lib/data/gift-cards'
import { deactivateGiftCard, getAllGiftCards } from '@/lib/data/gift-cards'
import { verifySession } from '@/lib/dal'
import type { GiftCard } from '@/types'

const validateCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Skriv inn en gavekort-kode.')
    .transform((v) => v.toUpperCase().trim()),
})

export async function validateGiftCardAction(
  code: string
): Promise<{ valid: true; balance: number } | { valid: false; error: string }> {
  const parsed = validateCodeSchema.safeParse({ code })
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0].message }
  }

  return validateGiftCard(parsed.data.code)
}

export async function getGiftCardsAdmin(): Promise<GiftCard[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []
  return getAllGiftCards()
}

export async function deactivateGiftCardAction(
  code: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  const result = await deactivateGiftCard(code)
  if (!result) {
    return { success: false, error: 'Kunne ikke deaktivere gavekortet.' }
  }
  return { success: true }
}
