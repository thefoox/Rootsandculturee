import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Booking, BookingStatus } from '@/types'

function docToBooking(id: string, data: Record<string, unknown>): Booking {
  return {
    id,
    confirmationCode: (data.confirmationCode as string) || '',
    stripeSessionId: (data.stripeSessionId as string) || '',
    customerId: (data.customerId as string) || null,
    customerEmail: (data.customerEmail as string) || '',
    customerName: (data.customerName as string) || '',
    experienceId: (data.experienceId as string) || '',
    experienceName: (data.experienceName as string) || '',
    dateId: (data.dateId as string) || '',
    date: data.date
      ? new Date((data.date as { _seconds: number })._seconds * 1000)
      : new Date(),
    seats: (data.seats as number) || 1,
    pricePerSeat: (data.pricePerSeat as number) || 0,
    total: (data.total as number) || 0,
    whatToBring: (data.whatToBring as string) || '',
    status: (data.status as BookingStatus) || 'pending',
    createdAt: data.createdAt
      ? new Date((data.createdAt as { _seconds: number })._seconds * 1000)
      : new Date(),
    confirmedAt: data.confirmedAt
      ? new Date((data.confirmedAt as { _seconds: number })._seconds * 1000)
      : null,
  }
}

export const getBookings = unstable_cache(
  async (): Promise<Booking[]> => {
    if (!adminDb) return []

    const snapshot = await adminDb
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()))
  },
  ['bookings'],
  { tags: ['bookings'] }
)

export async function getBookingsByUser(uid: string): Promise<Booking[]> {
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('bookings')
    .where('customerId', '==', uid)
    .orderBy('date', 'desc')
    .limit(50)
    .get()

  return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()))
}

export async function getBookingsByExperience(experienceId: string): Promise<Booking[]> {
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('bookings')
    .where('experienceId', '==', experienceId)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()))
}

export async function getBookingsByExperienceAndDate(
  experienceId: string,
  dateId: string
): Promise<Booking[]> {
  if (!adminDb) return []

  const snapshot = await adminDb
    .collection('bookings')
    .where('experienceId', '==', experienceId)
    .where('dateId', '==', dateId)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()))
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  if (!adminDb) return null

  const doc = await adminDb.collection('bookings').doc(bookingId).get()
  if (!doc.exists) return null
  return docToBooking(doc.id, doc.data()!)
}
