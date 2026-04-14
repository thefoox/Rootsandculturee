'use server'

import { adminDb } from '@/lib/firebase/admin'
import type { CartItem } from '@/types'

export interface CartValidationResult {
  valid: CartItem[]
  removed: Array<{
    name: string
    reason: string
    id: string
    experienceDateId: string | null
    variantId: string | null
  }>
}

/**
 * Validates cart items against Firestore on the handlekurv page mount.
 * Removes stale/deleted/inactive items and returns which were removed and why.
 *
 * T-23-02 mitigation: Early return if items.length > 50 to prevent excessive Firestore reads.
 */
export async function validateCartItems(
  items: CartItem[]
): Promise<CartValidationResult> {
  if (items.length === 0) {
    return { valid: [], removed: [] }
  }

  // DoS guard: cap at 50 items to prevent excessive Firestore reads
  if (items.length > 50) {
    return { valid: items, removed: [] }
  }

  if (!adminDb) {
    // Build-time safety: adminDb may be null during static generation
    return { valid: items, removed: [] }
  }

  const valid: CartItem[] = []
  const removed: CartValidationResult['removed'] = []

  for (const item of items) {
    if (item.type === 'product') {
      const productDoc = await adminDb.collection('products').doc(item.id).get()

      if (!productDoc.exists) {
        removed.push({
          name: item.name,
          reason: 'Produktet er ikke lenger tilgjengelig.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      const product = productDoc.data()

      if (!product.publishedAt) {
        removed.push({
          name: item.name,
          reason: 'Produktet er ikke lenger tilgjengelig.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      if (item.variantId) {
        const variants = product.variants as Array<{ id: string }> | null
        const variantExists =
          Array.isArray(variants) && variants.some((v) => v.id === item.variantId)
        if (!variantExists) {
          removed.push({
            name: item.name,
            reason: 'Produktvarianten finnes ikke lenger.',
            id: item.id,
            experienceDateId: item.experienceDateId,
            variantId: item.variantId,
          })
          continue
        }
      }

      valid.push(item)
    } else if (item.type === 'experience') {
      const expDoc = await adminDb.collection('experiences').doc(item.id).get()

      if (!expDoc.exists) {
        removed.push({
          name: item.name,
          reason: 'Opplevelsen finnes ikke lenger.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      const dateDoc = await adminDb
        .collection(`experiences/${item.id}/dates`)
        .doc(item.experienceDateId!)
        .get()

      if (!dateDoc.exists) {
        removed.push({
          name: item.name,
          reason: 'Opplevelsesdatoen finnes ikke lenger.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      const dateData = dateDoc.data()

      if (dateData.isActive === false) {
        removed.push({
          name: item.name,
          reason: 'Opplevelsesdatoen er ikke lenger aktiv.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      if ((dateData.availableSeats as number) <= 0) {
        removed.push({
          name: item.name,
          reason: 'Opplevelsesdatoen er utsolgt.',
          id: item.id,
          experienceDateId: item.experienceDateId,
          variantId: item.variantId,
        })
        continue
      }

      valid.push(item)
    } else {
      // Gift cards: always valid — validated at checkout
      valid.push(item)
    }
  }

  return { valid, removed }
}
