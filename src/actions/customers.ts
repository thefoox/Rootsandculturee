'use server'

import { verifySession } from '@/lib/dal'
import { getAllUsers } from '@/lib/data/users'
import { adminDb } from '@/lib/firebase/admin'
import type { CustomerSummary, Order, Booking } from '@/types'

export async function getCustomerList(): Promise<CustomerSummary[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

  const users = await getAllUsers()
  if (!adminDb || users.length === 0) {
    return users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      orderCount: 0,
      bookingCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
      createdAt: u.createdAt,
    }))
  }

  // Batch-fetch order/booking aggregates per customer
  const customerMap = new Map<string, CustomerSummary>()
  for (const u of users) {
    customerMap.set(u.uid, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      orderCount: 0,
      bookingCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
      createdAt: u.createdAt,
    })
  }

  // Aggregate orders
  const ordersSnap = await adminDb
    .collection('orders')
    .where('customerId', '!=', null)
    .get()

  for (const doc of ordersSnap.docs) {
    const data = doc.data()
    const cid = data.customerId as string
    const customer = customerMap.get(cid)
    if (!customer) continue

    customer.orderCount++
    customer.totalSpent += (data.total as number) || 0

    const createdAt = data.createdAt
      ? new Date((data.createdAt as { _seconds: number })._seconds * 1000)
      : null
    if (createdAt && (!customer.lastOrderDate || createdAt > customer.lastOrderDate)) {
      customer.lastOrderDate = createdAt
    }
  }

  // Aggregate bookings
  const bookingsSnap = await adminDb
    .collection('bookings')
    .where('customerId', '!=', null)
    .get()

  for (const doc of bookingsSnap.docs) {
    const data = doc.data()
    const cid = data.customerId as string
    const customer = customerMap.get(cid)
    if (!customer) continue
    customer.bookingCount++
  }

  return Array.from(customerMap.values())
}

export async function getCustomerDetail(uid: string): Promise<{
  customer: CustomerSummary
  orders: Order[]
  bookings: Booking[]
} | null> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return null
  if (!adminDb) return null

  const { getUserProfile } = await import('@/lib/data/users')
  const { getOrdersByUser } = await import('@/lib/data/orders')
  const { getBookingsByUser } = await import('@/lib/data/bookings')

  const [user, orders, bookings] = await Promise.all([
    getUserProfile(uid),
    getOrdersByUser(uid),
    getBookingsByUser(uid),
  ])

  if (!user) return null

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
  const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null

  return {
    customer: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      orderCount: orders.length,
      bookingCount: bookings.length,
      totalSpent,
      lastOrderDate,
      createdAt: user.createdAt,
    },
    orders,
    bookings,
  }
}
