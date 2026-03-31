'use server'

import { verifySession } from '@/lib/dal'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/lib/firebase/admin'
import { revalidateTag } from 'next/cache'
import type { OrderRefund } from '@/types'

export async function createRefund(
  orderId: string,
  amount?: number,
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }

  if (!stripe || !adminDb) {
    return { success: false, error: 'Stripe eller database ikke konfigurert.' }
  }

  try {
    const orderDoc = await adminDb.collection('orders').doc(orderId).get()
    if (!orderDoc.exists) {
      return { success: false, error: 'Ordre ikke funnet.' }
    }

    const orderData = orderDoc.data()!
    const paymentIntentId = orderData.stripePaymentIntentId as string

    if (!paymentIntentId) {
      return { success: false, error: 'Ingen Stripe-betaling knyttet til denne ordren.' }
    }

    // Build refund params
    const refundParams: {
      payment_intent: string
      amount?: number
      reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent'
    } = {
      payment_intent: paymentIntentId,
    }

    if (amount && amount > 0) {
      refundParams.amount = amount
    }

    if (reason) {
      refundParams.reason = reason
    }

    // Create refund via Stripe with idempotency key
    const refund = await stripe.refunds.create(refundParams, {
      idempotencyKey: `refund-${orderId}-${Date.now()}`,
    })

    // Update order status if full refund
    const orderTotal = (orderData.total as number) || 0
    const refundedAmount = refund.amount || 0

    // Check total refunded for this payment intent
    const allRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })
    const totalRefunded = allRefunds.data.reduce((sum, r) => sum + (r.amount || 0), 0)

    if (totalRefunded >= orderTotal) {
      await adminDb.collection('orders').doc(orderId).update({
        status: 'cancelled',
      })
    }

    revalidateTag('orders', 'max')
    return { success: true }
  } catch (err) {
    console.error('Refund error:', err)
    const message = err instanceof Error ? err.message : 'Ukjent feil ved refusjon.'
    return { success: false, error: message }
  }
}

export async function getRefundsForOrder(
  paymentIntentId: string
): Promise<OrderRefund[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

  if (!stripe || !paymentIntentId) return []

  try {
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 20,
    })

    return refunds.data.map((r) => ({
      id: r.id,
      amount: r.amount || 0,
      reason: r.reason,
      status: r.status || 'unknown',
      createdAt: new Date((r.created || 0) * 1000),
    }))
  } catch (err) {
    console.error('Error fetching refunds:', err)
    return []
  }
}
