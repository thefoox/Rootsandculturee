import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Order, OrderStatus } from '@/types'

function docToOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    stripeSessionId: (data.stripeSessionId as string) || '',
    stripePaymentIntentId: (data.stripePaymentIntentId as string) || '',
    customerId: (data.customerId as string) || null,
    customerEmail: (data.customerEmail as string) || '',
    status: (data.status as OrderStatus) || 'pending',
    items: (data.items as Order['items']) || [],
    shipping: (data.shipping as Order['shipping']) || null,
    subtotal: (data.subtotal as number) || 0,
    shippingCost: (data.shippingCost as number) || 0,
    total: (data.total as number) || 0,
    createdAt: data.createdAt
      ? new Date((data.createdAt as { _seconds: number })._seconds * 1000)
      : new Date(),
    paidAt: data.paidAt
      ? new Date((data.paidAt as { _seconds: number })._seconds * 1000)
      : null,
    fulfilledAt: data.fulfilledAt
      ? new Date((data.fulfilledAt as { _seconds: number })._seconds * 1000)
      : null,
  }
}

export const getOrders = unstable_cache(
  async (): Promise<Order[]> => {
    if (!adminDb) return []

    const snapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    return snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()))
  },
  ['orders'],
  { tags: ['orders'] }
)

export async function getOrdersByUser(uid: string): Promise<Order[]> {
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('orders')
    .where('customerId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  return snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()))
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!adminDb) return null

  const doc = await adminDb.collection('orders').doc(orderId).get()
  if (!doc.exists) return null
  return docToOrder(doc.id, doc.data()!)
}
