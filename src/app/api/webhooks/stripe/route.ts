import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { revalidateTag } from 'next/cache'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import {
  orderConfirmationEmail,
  bookingConfirmationEmail,
  mixedConfirmationEmail,
  giftCardEmail,
} from '@/lib/email/templates'
import { syncPaymentContact } from '@/lib/email/contacts'
import { createGiftCard, redeemGiftCard } from '@/lib/data/gift-cards'
import type { OrderItem, ShippingAddress } from '@/types'
import type { DocRef, FSData } from '@/lib/firebase/firestore-rest'

export const dynamic = 'force-dynamic'

interface ProductMetaItem {
  productId: string
  name: string
  price: number
  quantity: number
  variantId?: string | null
  variantLabel?: string | null
}

interface BookingMetaItem {
  experienceId: string
  name: string
  price: number
  quantity: number
  experienceDateId: string
  experienceDate: string
  experienceName: string
  isEarlybird?: boolean
}

interface GiftCardMetaItem {
  amount: number
  name: string
}

export async function POST(req: Request) {
  const { validateEnv } = await import('@/lib/env')
  validateEnv()

  if (!stripe) {
    return NextResponse.json(
      { error: 'Server ikke konfigurert.' },
      { status: 500 }
    )
  }

  const rawBody = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    )
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    )
  }

  // Idempotency check: skip events that are already completed or in-flight
  const eventDoc = await adminDb.collection('stripeEvents').doc(event.id).get()
  if (eventDoc.exists) {
    const eventStatus = eventDoc.data()?.status
    if (eventStatus === 'completed' || eventStatus === 'processing') {
      // Already handled or in-flight — return 200 to stop Stripe retrying
      return NextResponse.json({ received: true }, { status: 200 })
    }
  }

  // Mark event as processing before handling
  await adminDb.collection('stripeEvents').doc(event.id).set({
    type: event.type,
    status: 'processing',
    startedAt: new Date(),
  })

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const metadata = paymentIntent.metadata

      const customerEmail = metadata.customerEmail || ''
      const customerId = metadata.customerId && metadata.customerId !== '' ? metadata.customerId : null
      const shippingCost = parseInt(metadata.shippingCost || '0', 10)
      const subtotal = parseInt(metadata.subtotal || '0', 10)

      let orderItems: ProductMetaItem[] = []
      let bookingItems: BookingMetaItem[] = []
      let giftCardItems: GiftCardMetaItem[] = []

      try { orderItems = JSON.parse(metadata.orderItems || '[]') } catch (e) {
        console.error('Failed to parse orderItems metadata:', e)
      }
      try { bookingItems = JSON.parse(metadata.bookingItems || '[]') } catch (e) {
        console.error('Failed to parse bookingItems metadata:', e)
      }
      try { giftCardItems = JSON.parse(metadata.giftCardItems || '[]') } catch (e) {
        console.error('Failed to parse giftCardItems metadata:', e)
      }

      if (orderItems.length === 0 && bookingItems.length === 0 && giftCardItems.length === 0) {
        console.error('No items found in payment metadata:', paymentIntent.id)
      }

      const giftCardCodeUsed = metadata.giftCardCode || ''
      const giftCardDeduction = parseInt(metadata.giftCardDeduction || '0', 10)

      let shippingAddress: ShippingAddress | null = null
      if (metadata.shippingAddress) {
        try {
          shippingAddress = JSON.parse(metadata.shippingAddress)
        } catch {
          console.error('Failed to parse shippingAddress metadata:', metadata.shippingAddress)
        }
      }

      let orderId: string | null = null
      let firestoreItems: OrderItem[] = []
      const bookingResults: Array<{
        confirmationCode: string
        experienceName: string
        date: Date
        seats: number
        pricePerSeat: number
        total: number
        isEarlybird: boolean
        whatToBring: string
      }> = []

      // Process product orders
      if (orderItems.length > 0) {
        firestoreItems = await Promise.all(
          orderItems.map(async (item) => {
            let image: { url: string; alt: string } | null = null
            try {
              const productDoc = await adminDb.collection('products').doc(item.productId).get()
              if (productDoc.exists) {
                const productData = productDoc.data()
                image = (productData?.images as { url: string; alt: string }[])?.[0] ?? null
              }
            } catch {
              // Non-critical: order proceeds without image
            }
            return {
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image,
              variantId: item.variantId ?? null,
              variantLabel: item.variantLabel ?? null,
            }
          })
        )

        const orderRef = await adminDb.collection('orders').add({
          stripeSessionId: '',
          stripePaymentIntentId: paymentIntent.id,
          customerId,
          customerEmail,
          status: 'paid',
          items: firestoreItems,
          shipping: shippingAddress,
          subtotal,
          shippingCost,
          total: paymentIntent.amount,
          createdAt: new Date(),
          paidAt: new Date(),
          fulfilledAt: null,
        })
        orderId = orderRef.id

        // Decrement stock for each product using transactions
        for (const item of orderItems) {
          const productDocRef = adminDb.collection('products').doc(item.productId) as unknown as DocRef
          await adminDb.runTransaction(async (tx) => {
            const productDoc = await tx.get(productDocRef)
            if (!productDoc.exists) return
            const data = productDoc.data()
            const currentStock = (data.stockCount as number) ?? 0

            // Guard: verify sufficient stock inside the transaction (prevents race condition)
            if (currentStock < item.quantity) {
              throw new Error(`STOCK_INSUFFICIENT:${item.productId}:${item.name}`)
            }

            const newStock = currentStock - item.quantity
            const updates: Record<string, unknown> = {
              stockCount: newStock,
              inStock: newStock > 0,
            }
            if (item.variantId && Array.isArray(data.variants)) {
              const variants = (data.variants as Array<{ id: string; stockCount?: number }>).map((v) => {
                if (v.id === item.variantId) {
                  const variantStock = v.stockCount ?? 0
                  if (variantStock < item.quantity) {
                    throw new Error(`STOCK_INSUFFICIENT:${item.productId}:variant:${item.variantId}`)
                  }
                  return { ...v, stockCount: variantStock - item.quantity }
                }
                return v
              })
              updates.variants = variants
            }
            tx.update(productDocRef, updates as FSData)
          })
        }
      }

      // Process booking items using transactions
      for (const item of bookingItems) {
        const confirmationCode = crypto
          .randomBytes(4)
          .toString('hex')
          .toUpperCase()

        const dateDocRef = adminDb
          .collection(`experiences/${item.experienceId}/dates`)
          .doc(item.experienceDateId) as unknown as DocRef

        await adminDb.runTransaction(async (tx) => {
          const dateDoc = await tx.get(dateDocRef)
          if (!dateDoc.exists) {
            throw new Error(`Date ${item.experienceDateId} not found`)
          }
          const dateData = dateDoc.data()
          const availableSeats = (dateData.availableSeats as number) ?? 0
          if (availableSeats < item.quantity) {
            throw new Error(`Not enough seats for ${item.experienceName}`)
          }

          // Decrement seats atomically
          tx.update(dateDocRef, {
            bookedSeats: ((dateData.bookedSeats as number) ?? 0) + item.quantity,
            availableSeats: availableSeats - item.quantity,
          })

          // Get whatToBring from experience document
          const expDocRef = adminDb.collection('experiences').doc(item.experienceId) as unknown as DocRef
          const expDoc = await tx.get(expDocRef)
          const whatToBring = (expDoc.data()?.whatToBring as string) || ''

          // Create booking document
          const bookingDocRef = adminDb.collection('bookings').doc() as unknown as DocRef
          tx.set(bookingDocRef, {
            confirmationCode,
            stripeSessionId: '',
            stripePaymentIntentId: paymentIntent.id,
            customerId,
            customerEmail,
            customerName: metadata.customerName || shippingAddress?.fullName || '',
            customerPhone: metadata.customerPhone || '',
            experienceId: item.experienceId,
            experienceName: item.experienceName,
            dateId: item.experienceDateId,
            date: new Date(item.experienceDate),
            seats: item.quantity,
            pricePerSeat: item.price,
            total: item.price * item.quantity,
            isEarlybird: item.isEarlybird ?? false,
            whatToBring,
            status: 'confirmed',
            createdAt: new Date(),
            confirmedAt: new Date(),
          })

          bookingResults.push({
            confirmationCode,
            experienceName: item.experienceName,
            date: new Date(item.experienceDate),
            seats: item.quantity,
            pricePerSeat: item.price,
            isEarlybird: item.isEarlybird ?? false,
            total: item.price * item.quantity,
            whatToBring,
          })
        })
      }

      // Invalidate caches so admin pages show new data
      if (orderId) {
        revalidateTag('orders', 'max')
      }
      if (bookingItems.length > 0) {
        revalidateTag('bookings', 'max')
        revalidateTag('experience-dates', 'max')
      }

      // Process gift card purchases
      const createdGiftCards: Array<{ code: string; amount: number; recipientEmail: string; recipientName: string }> = []
      for (const item of giftCardItems) {
        const gc = await createGiftCard({
          amount: item.amount,
          purchasedBy: customerId,
          purchaserEmail: customerEmail,
          recipientName: metadata.giftCardRecipientName || '',
          recipientEmail: metadata.giftCardRecipientEmail || customerEmail,
          message: metadata.giftCardMessage || '',
        })
        if (gc) {
          createdGiftCards.push({
            code: gc.code,
            amount: gc.amount,
            recipientEmail: gc.recipientEmail,
            recipientName: gc.recipientName,
          })
        }
      }

      // Redeem gift card if one was used
      if (giftCardCodeUsed && giftCardDeduction > 0) {
        await redeemGiftCard(giftCardCodeUsed, giftCardDeduction)
      }

      // Send gift card emails to recipients
      if (resend && createdGiftCards.length > 0) {
        try {
          for (const gc of createdGiftCards) {
            const emailData = giftCardEmail({
              code: gc.code,
              amount: gc.amount,
              recipientName: gc.recipientName,
              senderEmail: customerEmail,
              message: metadata.giftCardMessage || '',
            })
            await resend.emails.send({
              from: FROM_EMAIL,
              to: gc.recipientEmail || customerEmail,
              subject: emailData.subject,
              text: emailData.text,
            })
          }
        } catch (gcEmailErr) {
          console.error('Gift card email error:', gcEmailErr)
        }
      }

      // Send confirmation emails
      if (resend && customerEmail) {
        try {
          if (orderItems.length > 0 && bookingResults.length > 0) {
            const emailData = mixedConfirmationEmail(
              {
                orderId: orderId || '',
                items: firestoreItems,
                subtotal,
                shippingCost,
                total: paymentIntent.amount,
                shipping: shippingAddress,
                customerEmail,
              },
              bookingResults.map((b) => ({ ...b, customerEmail }))
            )
            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: emailData.subject,
              text: emailData.text,
            })
          } else if (orderItems.length > 0) {
            const emailData = orderConfirmationEmail({
              orderId: orderId || '',
              items: firestoreItems,
              subtotal,
              shippingCost,
              total: paymentIntent.amount,
              shipping: shippingAddress,
              customerEmail,
            })
            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: emailData.subject,
              text: emailData.text,
            })
          } else if (bookingResults.length > 0) {
            for (const booking of bookingResults) {
              const emailData = bookingConfirmationEmail({ ...booking, customerEmail })
              await resend.emails.send({
                from: FROM_EMAIL,
                to: customerEmail,
                subject: emailData.subject,
                text: emailData.text,
              })
            }
          }
        } catch (emailErr) {
          console.error('Email sending error:', emailErr)
        }
      }

      // Sync contact to Resend segments (non-blocking)
      try {
        await syncPaymentContact({
          email: customerEmail,
          name: metadata.customerName || shippingAddress?.fullName || '',
          hasProducts: orderItems.length > 0,
          hasBookings: bookingResults.length > 0,
        })
      } catch {
        // Contact sync failure should never break the webhook
      }

    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object
      const paymentIntentId = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id || ''

      const isFullRefund = (charge.amount_refunded ?? 0) >= (charge.amount ?? 0)

      if (paymentIntentId) {
        const ordersSnapshot = await adminDb
          .collection('orders')
          .where('stripePaymentIntentId', '==', paymentIntentId)
          .limit(1)
          .get()

        if (!ordersSnapshot.empty) {
          const orderDoc = ordersSnapshot.docs[0]
          const refundAmount = charge.amount_refunded || 0

          await adminDb.collection('orders').doc(orderDoc.id).update({
            status: isFullRefund ? 'cancelled' : 'partially_refunded',
          })

          await adminDb.collection(`orders/${orderDoc.id}/refunds`).add({
            amount: refundAmount,
            reason: charge.refunds?.data?.[0]?.reason || null,
            status: 'succeeded',
            stripeRefundId: charge.refunds?.data?.[0]?.id || '',
            isFullRefund,
            createdAt: new Date(),
          })
        }

        if (isFullRefund) {
          const bookingsSnapshot = await adminDb
            .collection('bookings')
            .where('stripePaymentIntentId', '==', paymentIntentId)
            .get()

          for (const bookingDoc of bookingsSnapshot.docs) {
            const booking = bookingDoc.data()
            if (booking.status === 'confirmed' && booking.dateId) {
              const dateDocRef = adminDb
                .collection(`experiences/${booking.experienceId as string}/dates`)
                .doc(booking.dateId as string) as unknown as DocRef
              const bookingDocRef = adminDb
                .collection('bookings')
                .doc(bookingDoc.id) as unknown as DocRef

              await adminDb.runTransaction(async (tx) => {
                const dateDoc = await tx.get(dateDocRef)
                if (!dateDoc.exists) return
                const dateData = dateDoc.data()
                const currentBooked = (dateData.bookedSeats as number) || 0
                const currentAvailable = (dateData.availableSeats as number) || 0
                const seats = (booking.seats as number) || 1

                tx.update(dateDocRef, {
                  bookedSeats: Math.max(0, currentBooked - seats),
                  availableSeats: currentAvailable + seats,
                })
                tx.update(bookingDocRef, { status: 'cancelled' })
              })
            }
          }
        }
      }
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    if (errMsg.startsWith('STOCK_INSUFFICIENT')) {
      console.error('STOCK INSUFFICIENT — manual refund required:', errMsg, 'paymentIntentId:', (event.data?.object as { id?: string })?.id)
    }
    console.error('Webhook processing error:', err)
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 }
    )
  }

  // Mark event as completed after successful processing
  await adminDb.collection('stripeEvents').doc(event.id).update({
    status: 'completed',
    processedAt: new Date(),
  })

  return NextResponse.json({ received: true }, { status: 200 })
}
