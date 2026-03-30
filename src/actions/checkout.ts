'use server'

import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import type { CartItem } from '@/types'

const shippingSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er pakrevd.'),
  address: z.string().min(1, 'Adresse er pakrevd.'),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Postnummer ma vaere 4 siffer.'),
  city: z.string().min(1, 'Sted er pakrevd.'),
})

const contactOnlySchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
})

export interface CheckoutFormData {
  email: string
  fullName?: string
  address?: string
  postalCode?: string
  city?: string
}

const DEFAULT_SHIPPING_COST = 9900 // 99 NOK in ore

export async function createPaymentIntent(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<{ clientSecret: string } | { error: string }> {
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

  // Validate form data
  const schema = hasProducts ? shippingSchema : contactOnlySchema
  const validation = schema.safeParse(formData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError.message }
  }

  // Check session (optional -- guest checkout allowed per D-09)
  const session = await verifySession()
  const customerId = session?.uid ?? null
  const customerEmail = formData.email

  // Re-validate cart items against Firestore
  const productItems: CartItem[] = []
  const experienceItems: CartItem[] = []

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
      if (product.stockCount < item.quantity) {
        return { error: `Ikke nok "${item.name}" pa lager. Tilgjengelig: ${product.stockCount}.` }
      }
      // Use verified Firestore price (prevents price manipulation)
      productItems.push({ ...item, price: product.price })
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
      // Use verified Firestore price
      const verifiedPrice = dateData.priceOverride ?? expDoc.data()?.basePrice ?? item.price
      experienceItems.push({ ...item, price: verifiedPrice })
    }
  }

  const allItems = [...productItems, ...experienceItems]

  // Calculate total
  const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = hasProducts ? DEFAULT_SHIPPING_COST : 0
  const total = subtotal + shippingCost

  if (total <= 0) {
    return { error: 'Ugyldig totalbelop.' }
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
        type: hasProducts && hasExperiences ? 'mixed' : hasProducts ? 'order' : 'booking',
        orderItems: JSON.stringify(
          productItems.map((i) => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            slug: i.slug,
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
            slug: i.slug,
          }))
        ),
        customerEmail,
        customerId: customerId || '',
        shippingAddress,
        shippingCost: String(shippingCost),
        subtotal: String(subtotal),
      },
      receipt_email: customerEmail,
    })

    if (!paymentIntent.client_secret) {
      return { error: 'Kunne ikke opprette betaling. Prov igjen.' }
    }

    return { clientSecret: paymentIntent.client_secret }
  } catch (err) {
    console.error('Stripe PaymentIntent creation error:', err)
    return { error: 'Noe gikk galt med betalingen. Prov igjen.' }
  }
}
