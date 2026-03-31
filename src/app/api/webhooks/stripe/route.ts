import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import {
  orderConfirmationEmail,
  bookingConfirmationEmail,
  mixedConfirmationEmail,
} from '@/lib/email/templates'
import { syncPaymentContact } from '@/lib/email/contacts'
import type { OrderItem, ShippingAddress } from '@/types'

export const dynamic = 'force-dynamic'

interface ProductMetaItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: { url: string; alt: string } | null
}

interface BookingMetaItem {
  experienceId: string
  name: string
  price: number
  quantity: number
  experienceDateId: string
  experienceDate: string
  experienceName: string
}

export async function POST(req: Request) {
  if (!stripe || !adminDb) {
    return NextResponse.json(
      { error: 'Server ikke konfigurert.' },
      { status: 500 }
    )
  }

  // CRITICAL: Use req.text() NOT req.json() for raw body (Pitfall 4)
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

  // Idempotency check (Pitfall 3): Check if event already processed
  const eventRef = adminDb.collection('stripeEvents').doc(event.id)
  const eventDoc = await eventRef.get()
  if (eventDoc.exists) {
    // Already processed -- return 200 to stop retries
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // Mark event as processing (write before processing for idempotency)
  await eventRef.set({
    type: event.type,
    processedAt: new Date(),
  })

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const metadata = paymentIntent.metadata

      const customerEmail = metadata.customerEmail || ''
      const customerId = metadata.customerId || null
      const shippingCost = parseInt(metadata.shippingCost || '0', 10)
      const subtotal = parseInt(metadata.subtotal || '0', 10)

      let orderItems: ProductMetaItem[] = []
      let bookingItems: BookingMetaItem[] = []

      try {
        orderItems = JSON.parse(metadata.orderItems || '[]')
      } catch { /* empty */ }
      try {
        bookingItems = JSON.parse(metadata.bookingItems || '[]')
      } catch { /* empty */ }

      const shippingAddress: ShippingAddress | null = metadata.shippingAddress
        ? JSON.parse(metadata.shippingAddress)
        : null

      let orderId: string | null = null
      const bookingResults: Array<{
        confirmationCode: string
        experienceName: string
        date: Date
        seats: number
        pricePerSeat: number
        total: number
        whatToBring: string
      }> = []

      // Process product orders
      if (orderItems.length > 0) {
        const firestoreItems: OrderItem[] = orderItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }))

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

        // Decrement stock for each product (PROD-07) using transaction
        for (const item of orderItems) {
          const productRef = adminDb.collection('products').doc(item.productId)
          await adminDb.runTransaction(async (transaction) => {
            const productDoc = await transaction.get(productRef)
            if (!productDoc.exists) return
            const currentStock = productDoc.data()?.stockCount ?? 0
            const newStock = Math.max(0, currentStock - item.quantity)
            transaction.update(productRef, {
              stockCount: newStock,
              inStock: newStock > 0,
            })
          })
        }
      }

      // Process booking items using Firestore transactions (Pitfall 2)
      for (const item of bookingItems) {
        const confirmationCode = crypto
          .randomBytes(4)
          .toString('hex')
          .toUpperCase()

        const dateRef = adminDb
          .collection('experiences')
          .doc(item.experienceId)
          .collection('dates')
          .doc(item.experienceDateId)

        await adminDb.runTransaction(async (transaction) => {
          const dateDoc = await transaction.get(dateRef)
          if (!dateDoc.exists) {
            throw new Error(`Date ${item.experienceDateId} not found`)
          }
          const dateData = dateDoc.data()!
          const availableSeats = dateData.availableSeats ?? 0
          if (availableSeats < item.quantity) {
            throw new Error(`Not enough seats for ${item.experienceName}`)
          }

          // Decrement seats atomically
          transaction.update(dateRef, {
            bookedSeats: (dateData.bookedSeats ?? 0) + item.quantity,
            availableSeats: availableSeats - item.quantity,
          })

          // Get whatToBring from experience document
          const expDoc = await transaction.get(
            adminDb!.collection('experiences').doc(item.experienceId)
          )
          const whatToBring = expDoc.data()?.whatToBring || ''

          // Create booking document
          const bookingRef = adminDb!.collection('bookings').doc()
          transaction.set(bookingRef, {
            confirmationCode,
            stripeSessionId: '',
            stripePaymentIntentId: paymentIntent.id,
            customerId,
            customerEmail,
            customerName: shippingAddress?.fullName || '',
            experienceId: item.experienceId,
            experienceName: item.experienceName,
            dateId: item.experienceDateId,
            date: new Date(item.experienceDate),
            seats: item.quantity,
            pricePerSeat: item.price,
            total: item.price * item.quantity,
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
            total: item.price * item.quantity,
            whatToBring,
          })
        })
      }

      // Send confirmation emails via Resend (D-18, D-20)
      if (resend && customerEmail) {
        try {
          if (orderItems.length > 0 && bookingResults.length > 0) {
            // Mixed confirmation
            const emailData = mixedConfirmationEmail(
              {
                orderId: orderId || '',
                items: orderItems.map((i) => ({
                  productId: i.productId,
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                  image: i.image,
                })),
                subtotal,
                shippingCost,
                total: paymentIntent.amount,
                shipping: shippingAddress,
                customerEmail,
              },
              bookingResults.map((b) => ({
                ...b,
                customerEmail,
              }))
            )
            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: emailData.subject,
              text: emailData.text,
            })
          } else if (orderItems.length > 0) {
            // Order only
            const emailData = orderConfirmationEmail({
              orderId: orderId || '',
              items: orderItems.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image,
              })),
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
            // Booking only
            for (const booking of bookingResults) {
              const emailData = bookingConfirmationEmail({
                ...booking,
                customerEmail,
              })
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
          // Don't fail the webhook for email errors
        }
      }

      // Sync contact to Resend segments (non-blocking)
      try {
        await syncPaymentContact({
          email: customerEmail,
          name: shippingAddress?.fullName || '',
          hasProducts: orderItems.length > 0,
          hasBookings: bookingResults.length > 0,
        })
      } catch {
        // Contact sync failure should never break the webhook
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Still return 200 to prevent Stripe from retrying a failed event
    // The event is already marked as processed (idempotency)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
