'use server'

import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import { unstable_cache, revalidateTag } from 'next/cache'
import type { Order, OrderStatus, ShippingAddress, OrderNote } from '@/types'

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

export async function getOrderByStripePaymentIntent(
  paymentIntentId: string
): Promise<Order | null> {
  if (!adminDb) return null

  const snapshot = await adminDb
    .collection('orders')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get()

  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return docToOrder(doc.id, doc.data())
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!adminDb) return null

  const doc = await adminDb.collection('orders').doc(orderId).get()
  if (!doc.exists) return null
  return docToOrder(doc.id, doc.data()!)
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

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  if (!adminDb) return

  await adminDb.collection('orders').doc(orderId).update({
    status,
    ...(status === 'shipped' ? { fulfilledAt: new Date() } : {}),
  })

  revalidateTag('orders', 'max')
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Promise<string> {
  if (!adminDb) throw new Error('Database ikke tilgjengelig.')

  const docRef = await adminDb.collection('orders').add({
    ...data,
    createdAt: new Date(),
  })

  revalidateTag('orders', 'max')
  return docRef.id
}

export async function updateOrderShipping(
  orderId: string,
  shipping: ShippingAddress
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }
  if (!adminDb) return { success: false, error: 'Database ikke tilgjengelig.' }

  try {
    await adminDb.collection('orders').doc(orderId).update({ shipping })
    revalidateTag('orders', 'max')
    return { success: true }
  } catch {
    return { success: false, error: 'Kunne ikke oppdatere leveringsadresse.' }
  }
}

export async function addOrderNote(
  orderId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }
  if (!adminDb) return { success: false, error: 'Database ikke tilgjengelig.' }
  if (!text.trim()) return { success: false, error: 'Notatet kan ikke vaere tomt.' }

  try {
    await adminDb
      .collection('orders')
      .doc(orderId)
      .collection('notes')
      .add({
        text: text.trim(),
        createdBy: session.email,
        createdAt: new Date(),
      })
    return { success: true }
  } catch {
    return { success: false, error: 'Kunne ikke legge til notat.' }
  }
}

export async function getOrderNotes(orderId: string): Promise<OrderNote[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('orders')
    .doc(orderId)
    .collection('notes')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      text: (data.text as string) || '',
      createdBy: (data.createdBy as string) || '',
      createdAt: data.createdAt
        ? new Date((data.createdAt as { _seconds: number })._seconds * 1000)
        : new Date(),
    }
  })
}

export async function getOrderStats(): Promise<{
  orderCount: number
  totalRevenue: number
  averageOrder: number
  bookingCount: number
  customerCount: number
}> {
  if (!adminDb) {
    return { orderCount: 0, totalRevenue: 0, averageOrder: 0, bookingCount: 0, customerCount: 0 }
  }

  const [ordersSnap, bookingsSnap, usersSnap] = await Promise.all([
    adminDb.collection('orders').get(),
    adminDb.collection('bookings').count().get(),
    adminDb.collection('users').count().get(),
  ])

  let totalRevenue = 0
  for (const doc of ordersSnap.docs) {
    totalRevenue += (doc.data().total as number) || 0
  }

  const orderCount = ordersSnap.size
  const averageOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0

  return {
    orderCount,
    totalRevenue,
    averageOrder,
    bookingCount: bookingsSnap.data().count,
    customerCount: usersSnap.data().count,
  }
}
