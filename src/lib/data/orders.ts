import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Order, OrderStatus } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function docToOrder(doc: FirestoreDoc): Order {
  const data = doc.data()
  return {
    id: doc.id,
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
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    paidAt: data.paidAt instanceof Date ? data.paidAt : null,
    fulfilledAt: data.fulfilledAt instanceof Date ? data.fulfilledAt : null,
  }
}

export const getOrders = unstable_cache(
  async (): Promise<Order[]> => {
    const snapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
    return snapshot.docs.map(docToOrder)
  },
  ['orders'],
  { tags: ['orders'] }
)

export async function getOrdersByUser(uid: string, email?: string): Promise<Order[]> {
  // Query by customerId (primary)
  const byIdSnapshot = await adminDb
    .collection('orders')
    .where('customerId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  const orders = byIdSnapshot.docs.map(docToOrder)

  // Also find orders by email where customerId was empty (guest checkout fallback)
  if (email) {
    const byEmailSnapshot = await adminDb
      .collection('orders')
      .where('customerEmail', '==', email)
      .where('customerId', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const existingIds = new Set(orders.map((o) => o.id))
    for (const doc of byEmailSnapshot.docs) {
      if (!existingIds.has(doc.id)) {
        orders.push(docToOrder(doc))
      }
    }

    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  return orders
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const doc = await adminDb.collection('orders').doc(orderId).get()
  if (!doc.exists) return null
  return docToOrder(doc)
}
