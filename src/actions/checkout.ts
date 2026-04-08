'use server'

import crypto from 'crypto'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import { validateGiftCard, redeemGiftCard } from '@/lib/data/gift-cards'
import type { CartItem } from '@/types'

const shippingSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er påkrevd.'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer.'),
  address: z.string().min(1, 'Adresse er påkrevd.'),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Postnummer må være 4 siffer.'),
  city: z.string().min(1, 'Sted er påkrevd.'),
})

const contactOnlySchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er påkrevd.'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer.'),
})

export interface CheckoutFormData {
  email: string
  fullName?: string
  phone?: string
  address?: string
  postalCode?: string
  city?: string
  isInit?: boolean    // true for initial PI creation before user fills form
}

const DEFAULT_SHIPPING_COST = 9900 // 99 NOK in ore

export async function createPaymentIntent(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  giftCardCode?: string | null
): Promise<{ clientSecret: string } | { error: string } | { coveredByGiftCard: true; giftCardCode: string; totalDeducted: number }> {
  if (!stripe) {
    return { error: 'Betalingssystemet er ikke konfigurert. Kontakt oss.' }
  }

  if (!adminDb) {
    return { error: 'Systemet er ikke tilgjengelig. Provigjen senere.' }
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: 'Handlekurven er tom.' }
  }

  // Determine if cart has products (needs shipping)
  const hasProducts = cartItems.some((item) => item.type === 'product')
  const hasExperiences = cartItems.some((item) => item.type === 'experience')
  const hasGiftCards = cartItems.some((item) => item.type === 'giftcard')

  // Validate form data (skip full validation for initial PaymentIntent creation)
  const isInitCall = formData.isInit === true
  if (!isInitCall) {
    const schema = hasProducts ? shippingSchema : contactOnlySchema
    const validation = schema.safeParse(formData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return { error: firstError.message }
    }
  }

  // Check session (optional -- guest checkout allowed per D-09)
  const session = await verifySession()
  const customerId = session?.uid ?? null
  const customerEmail = formData.email

  // Re-validate cart items against Firestore
  const productItems: CartItem[] = []
  const experienceItems: CartItem[] = []
  const giftCardItems: CartItem[] = []

  for (const item of cartItems) {
    if (item.type === 'product') {
      const productDoc = await adminDb.collection('products').doc(item.id).get()
      if (!productDoc.exists) {
        return { error: `Produktet "${item.name}" finnes ikke lenger.` }
      }
      const product = productDoc.data()
      if (!product?.publishedAt) {
        return { error: `Produktet "${item.name}" er ikke tilgjengelig.` }
      }
      // Use variant price/stock if applicable
      let verifiedPrice = product.price
      let verifiedStock = product.stockCount
      if (item.variantId && product.variants?.length > 0) {
        const variant = product.variants.find((v: { id: string; price: number; stockCount: number }) => v.id === item.variantId)
        if (variant) {
          verifiedPrice = variant.price
          verifiedStock = variant.stockCount
        }
      }
      if (verifiedStock < item.quantity) {
        return { error: `Ikke nok "${item.name}" på lager. Tilgjengelig: ${verifiedStock}.` }
      }
      productItems.push({ ...item, price: verifiedPrice })
    } else if (item.type === 'giftcard') {
      // Gift card purchases: trust client price (validated min/max)
      const amountNOK = item.price / 100
      if (amountNOK < 100 || amountNOK > 10000) {
        return { error: 'Ugyldig gavekort-beløp.' }
      }
      giftCardItems.push(item)
    } else {
      // Experience booking
      if (!item.experienceDateId) {
        return { error: `Ugyldig booking for "${item.name}".` }
      }
      const expDoc = await adminDb.collection('experiences').doc(item.id).get()
      if (!expDoc.exists) {
        return { error: `Opplevelsen "${item.name}" finnes ikke lenger.` }
      }
      const dateDoc = await adminDb
        .collection('experiences')
        .doc(item.id)
        .collection('dates')
        .doc(item.experienceDateId)
        .get()
      if (!dateDoc.exists) {
        return { error: `Datoen for "${item.name}" er ikke tilgjengelig.` }
      }
      const dateData = dateDoc.data()
      if (!dateData?.isActive || dateData.availableSeats < item.quantity) {
        return { error: `Ingen ledige plasser for "${item.name}" pa valgt dato.` }
      }
      // Use verified Firestore price (earlybird or priceOverride or basePrice)
      const now = new Date()
      let verifiedPrice = dateData.priceOverride ?? expDoc.data()?.basePrice ?? item.price
      if (dateData.earlyBirdPrice && dateData.earlyBirdDeadline && dateData.earlyBirdDeadline.toDate() > now) {
        verifiedPrice = dateData.earlyBirdPrice
      }
      experienceItems.push({ ...item, price: verifiedPrice })
    }
  }

  const allItems = [...productItems, ...experienceItems, ...giftCardItems]

  // Calculate total
  const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = hasProducts ? DEFAULT_SHIPPING_COST : 0
  let total = subtotal + shippingCost

  // Apply gift card deduction
  let giftCardDeduction = 0
  if (giftCardCode) {
    const gcResult = await validateGiftCard(giftCardCode)
    if (!gcResult.valid) {
      return { error: gcResult.error }
    }
    giftCardDeduction = Math.min(gcResult.balance, total)
    total = total - giftCardDeduction

    // If gift card covers the full amount, no Stripe payment needed
    if (total <= 0) {
      return {
        coveredByGiftCard: true,
        giftCardCode,
        totalDeducted: giftCardDeduction,
      }
    }
  }

  if (total <= 0) {
    return { error: 'Ugyldig totalbeløp.' }
  }

  // Build shipping address for metadata
  const shippingAddress = hasProducts
    ? JSON.stringify({
        fullName: formData.fullName || '',
        address: formData.address || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
      })
    : ''

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'nok',
      metadata: {
        type: hasProducts && hasExperiences ? 'mixed' : hasProducts ? 'order' : hasGiftCards ? 'giftcard' : 'booking',
        // Exclude image/slug from metadata to stay within Stripe's 500-char limit per value.
        // The webhook can re-fetch image data from Firestore by productId if needed.
        orderItems: JSON.stringify(
          productItems.map((i) => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variantId: i.variantId,
            variantLabel: i.variantLabel,
          }))
        ),
        bookingItems: JSON.stringify(
          experienceItems.map((i) => ({
            experienceId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            experienceDateId: i.experienceDateId,
            experienceDate: i.experienceDate,
            experienceName: i.experienceName ?? i.name,
            isEarlybird: i.isEarlybird ?? false,
          }))
        ),
        giftCardItems: JSON.stringify(
          giftCardItems.map((i) => ({
            amount: i.price,
            name: i.name,
          }))
        ),
        giftCardRecipientName: giftCardItems[0]?.giftCardRecipientName || '',
        giftCardRecipientEmail: giftCardItems[0]?.giftCardRecipientEmail || '',
        giftCardMessage: giftCardItems[0]?.giftCardMessage || '',
        customerEmail,
        customerName: formData.fullName || '',
        customerPhone: formData.phone || '',
        customerId: customerId ?? '',
        shippingAddress,
        shippingCost: String(shippingCost),
        subtotal: String(subtotal),
        giftCardCode: giftCardCode || '',
        giftCardDeduction: String(giftCardDeduction),
      },
      receipt_email: customerEmail,
    })

    if (!paymentIntent.client_secret) {
      return { error: 'Kunne ikke opprette betaling. Prøv igjen.' }
    }

    return { clientSecret: paymentIntent.client_secret }
  } catch (err) {
    console.error('Stripe PaymentIntent creation error:', err)
    return { error: 'Noe gikk galt med betalingen. Prøv igjen.' }
  }
}

export async function getCheckoutUser(): Promise<{ email: string | null }> {
  const session = await verifySession()
  return { email: session?.email ?? null }
}

export async function updatePaymentIntentMetadata(
  paymentIntentId: string,
  formData: CheckoutFormData,
  cartItems: CartItem[],
  giftCardCode?: string | null
): Promise<{ success: true } | { error: string } | { coveredByGiftCard: true; giftCardCode: string; totalDeducted: number }> {
  if (!stripe) {
    return { error: 'Betalingssystemet er ikke konfigurert. Kontakt oss.' }
  }

  if (!adminDb) {
    return { error: 'Systemet er ikke tilgjengelig. Prøv igjen senere.' }
  }

  if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
    return { error: 'Ugyldig betalings-ID.' }
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: 'Handlekurven er tom.' }
  }

  // Determine cart composition
  const hasProducts = cartItems.some((item) => item.type === 'product')
  const hasExperiences = cartItems.some((item) => item.type === 'experience')
  const hasGiftCards = cartItems.some((item) => item.type === 'giftcard')

  // Always validate formData with the appropriate schema
  const schema = hasProducts ? shippingSchema : contactOnlySchema
  const validation = schema.safeParse(formData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError.message }
  }

  // Check session (optional — guest checkout allowed)
  const session = await verifySession()
  const customerId = session?.uid ?? null
  const customerEmail = formData.email

  // Re-validate all cart items against Firestore
  const productItems: CartItem[] = []
  const experienceItems: CartItem[] = []
  const giftCardItems: CartItem[] = []

  for (const item of cartItems) {
    if (item.type === 'product') {
      const productDoc = await adminDb.collection('products').doc(item.id).get()
      if (!productDoc.exists) {
        return { error: `Produktet "${item.name}" finnes ikke lenger.` }
      }
      const product = productDoc.data()
      if (!product?.publishedAt) {
        return { error: `Produktet "${item.name}" er ikke tilgjengelig.` }
      }
      let verifiedPrice = product.price
      let verifiedStock = product.stockCount
      if (item.variantId && product.variants?.length > 0) {
        const variant = product.variants.find((v: { id: string; price: number; stockCount: number }) => v.id === item.variantId)
        if (variant) {
          verifiedPrice = variant.price
          verifiedStock = variant.stockCount
        }
      }
      if (verifiedStock < item.quantity) {
        return { error: `Ikke nok "${item.name}" på lager. Tilgjengelig: ${verifiedStock}.` }
      }
      productItems.push({ ...item, price: verifiedPrice })
    } else if (item.type === 'giftcard') {
      const amountNOK = item.price / 100
      if (amountNOK < 100 || amountNOK > 10000) {
        return { error: 'Ugyldig gavekort-beløp.' }
      }
      giftCardItems.push(item)
    } else {
      // Experience booking
      if (!item.experienceDateId) {
        return { error: `Ugyldig booking for "${item.name}".` }
      }
      const expDoc = await adminDb.collection('experiences').doc(item.id).get()
      if (!expDoc.exists) {
        return { error: `Opplevelsen "${item.name}" finnes ikke lenger.` }
      }
      const dateDoc = await adminDb
        .collection('experiences')
        .doc(item.id)
        .collection('dates')
        .doc(item.experienceDateId)
        .get()
      if (!dateDoc.exists) {
        return { error: `Datoen for "${item.name}" er ikke tilgjengelig.` }
      }
      const dateData = dateDoc.data()
      if (!dateData?.isActive || dateData.availableSeats < item.quantity) {
        return { error: `Ingen ledige plasser for "${item.name}" pa valgt dato.` }
      }
      const now = new Date()
      let verifiedPrice = dateData.priceOverride ?? expDoc.data()?.basePrice ?? item.price
      if (dateData.earlyBirdPrice && dateData.earlyBirdDeadline && dateData.earlyBirdDeadline.toDate() > now) {
        verifiedPrice = dateData.earlyBirdPrice
      }
      experienceItems.push({ ...item, price: verifiedPrice })
    }
  }

  const allItems = [...productItems, ...experienceItems, ...giftCardItems]

  // Calculate totals — amount will be updated on the PI if gift card applied
  const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = hasProducts ? DEFAULT_SHIPPING_COST : 0
  let total = subtotal + shippingCost

  let giftCardDeduction = 0
  if (giftCardCode) {
    const gcResult = await validateGiftCard(giftCardCode)
    if (!gcResult.valid) {
      return { error: gcResult.error }
    }
    giftCardDeduction = Math.min(gcResult.balance, total)
    total = total - giftCardDeduction
  }

  // If gift card covers the full amount, cancel PI and fulfill directly
  if (total <= 0 && giftCardCode && giftCardDeduction > 0) {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId)
    } catch (cancelErr) {
      console.error('Failed to cancel PI covered by gift card:', cancelErr)
      // PI may already be canceled or in a non-cancelable state — continue
    }
    // Redeem the gift card
    await redeemGiftCard(giftCardCode, giftCardDeduction)

    // Create order/bookings directly (fulfillment without Stripe payment)
    const customerEmail = formData.email
    const session = await verifySession()
    const customerId = session?.uid ?? null
    const shippingAddress: { fullName: string; address: string; postalCode: string; city: string } | null = hasProducts
      ? {
          fullName: formData.fullName || '',
          address: formData.address || '',
          postalCode: formData.postalCode || '',
          city: formData.city || '',
        }
      : null

    // Create order for product items
    if (productItems.length > 0) {
      await adminDb.collection('orders').add({
        stripeSessionId: '',
        stripePaymentIntentId: paymentIntentId,
        customerId,
        customerEmail,
        status: 'paid',
        items: productItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variantId: item.variantId ?? null,
          variantLabel: item.variantLabel ?? null,
        })),
        shipping: shippingAddress,
        subtotal,
        shippingCost,
        total: 0,
        createdAt: new Date(),
        paidAt: new Date(),
        fulfilledAt: null,
        paidByGiftCard: true,
        giftCardCode,
        giftCardDeduction,
      })

      // Decrement stock for each product (mirrors webhook stock decrement logic)
      for (const item of productItems) {
        const productRef = adminDb!.collection('products').doc(item.id)
        await adminDb!.runTransaction(async (transaction) => {
          const productDoc = await transaction.get(productRef)
          if (!productDoc.exists) return
          const data = productDoc.data()!
          const currentStock = data.stockCount ?? 0
          const newStock = Math.max(0, currentStock - item.quantity)
          const updates: Record<string, unknown> = {
            stockCount: newStock,
            inStock: newStock > 0,
          }
          if (item.variantId && Array.isArray(data.variants)) {
            const variants = data.variants.map((v: { id: string; stockCount?: number }) => {
              if (v.id === item.variantId) {
                return { ...v, stockCount: Math.max(0, (v.stockCount ?? 0) - item.quantity) }
              }
              return v
            })
            updates.variants = variants
          }
          transaction.update(productRef, updates)
        })
      }
    }

    // Create bookings for experience items
    for (const item of experienceItems) {
      const confirmationCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      const dateRef = adminDb
        .collection('experiences')
        .doc(item.id)
        .collection('dates')
        .doc(item.experienceDateId!)

      await adminDb.runTransaction(async (transaction) => {
        const dateDoc = await transaction.get(dateRef)
        if (!dateDoc.exists) return
        const dateData = dateDoc.data()!
        const availableSeats = dateData.availableSeats ?? 0
        if (availableSeats < item.quantity) return

        transaction.update(dateRef, {
          bookedSeats: (dateData.bookedSeats ?? 0) + item.quantity,
          availableSeats: availableSeats - item.quantity,
        })

        const bookingRef = adminDb!.collection('bookings').doc()
        transaction.set(bookingRef, {
          confirmationCode,
          stripeSessionId: '',
          stripePaymentIntentId: paymentIntentId,
          customerId,
          customerEmail,
          customerName: formData.fullName || '',
          customerPhone: formData.phone || '',
          experienceId: item.id,
          experienceName: item.experienceName ?? item.name,
          dateId: item.experienceDateId,
          date: new Date(item.experienceDate || ''),
          seats: item.quantity,
          pricePerSeat: item.price,
          total: item.price * item.quantity,
          status: 'confirmed',
          createdAt: new Date(),
          confirmedAt: new Date(),
          paidByGiftCard: true,
        })
      })
    }

    return {
      coveredByGiftCard: true,
      giftCardCode,
      totalDeducted: giftCardDeduction,
    }
  }

  // Build shipping address for metadata
  const shippingAddress = hasProducts
    ? JSON.stringify({
        fullName: formData.fullName || '',
        address: formData.address || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
      })
    : ''

  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: total,
      metadata: {
        type: hasProducts && hasExperiences ? 'mixed' : hasProducts ? 'order' : hasGiftCards ? 'giftcard' : 'booking',
        // Exclude image/slug from metadata to stay within Stripe's 500-char limit per value.
        orderItems: JSON.stringify(
          productItems.map((i) => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            variantId: i.variantId,
            variantLabel: i.variantLabel,
          }))
        ),
        bookingItems: JSON.stringify(
          experienceItems.map((i) => ({
            experienceId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            experienceDateId: i.experienceDateId,
            experienceDate: i.experienceDate,
            experienceName: i.experienceName ?? i.name,
            isEarlybird: i.isEarlybird ?? false,
          }))
        ),
        giftCardItems: JSON.stringify(
          giftCardItems.map((i) => ({
            amount: i.price,
            name: i.name,
          }))
        ),
        giftCardRecipientName: giftCardItems[0]?.giftCardRecipientName || '',
        giftCardRecipientEmail: giftCardItems[0]?.giftCardRecipientEmail || '',
        giftCardMessage: giftCardItems[0]?.giftCardMessage || '',
        customerEmail,
        customerName: formData.fullName || '',
        customerPhone: formData.phone || '',
        customerId: customerId || '',
        shippingAddress,
        shippingCost: String(shippingCost),
        subtotal: String(subtotal),
        giftCardCode: giftCardCode || '',
        giftCardDeduction: String(giftCardDeduction),
      },
    })

    return { success: true }
  } catch (err) {
    console.error('Stripe PaymentIntent update error:', err)
    return { error: 'Noe gikk galt med betalingen. Prøv igjen.' }
  }
}
