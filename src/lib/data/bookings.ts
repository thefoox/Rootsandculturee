import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import type { Booking, BookingStatus } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function docToBooking(doc: FirestoreDoc): Booking {
  const data = doc.data()
  return {
    id: doc.id,
    confirmationCode: (data.confirmationCode as string) || '',
    stripeSessionId: (data.stripeSessionId as string) || '',
    stripePaymentIntentId: (data.stripePaymentIntentId as string) || '',
    customerId: (data.customerId as string) || null,
    customerEmail: (data.customerEmail as string) || '',
    customerName: (data.customerName as string) || '',
    customerPhone: (data.customerPhone as string) || '',
    experienceId: (data.experienceId as string) || '',
    experienceName: (data.experienceName as string) || '',
    dateId: (data.dateId as string) || '',
    date: data.date instanceof Date ? data.date : new Date(),
    seats: (data.seats as number) || 1,
    pricePerSeat: (data.pricePerSeat as number) || 0,
    total: (data.total as number) || 0,
    isEarlybird: (data.isEarlybird as boolean) ?? false,
    whatToBring: (data.whatToBring as string) || '',
    status: (data.status as BookingStatus) || 'pending',
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    confirmedAt: data.confirmedAt instanceof Date ? data.confirmedAt : null,
  }
}

export async function getBookings(): Promise<Booking[]> {
  const snapshot = await adminDb
    .collection('bookings')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()
  return snapshot.docs.map(docToBooking)
}

export async function getBookingsByUser(uid: string, email?: string): Promise<Booking[]> {
  const byIdSnapshot = await adminDb
    .collection('bookings')
    .where('customerId', '==', uid)
    .orderBy('date', 'desc')
    .limit(50)
    .get()

  const bookings = byIdSnapshot.docs.map(docToBooking)

  if (email) {
    const byEmailSnapshot = await adminDb
      .collection('bookings')
      .where('customerEmail', '==', email)
      .where('customerId', '==', null)
      .orderBy('date', 'desc')
      .limit(50)
      .get()

    const existingIds = new Set(bookings.map((b) => b.id))
    for (const doc of byEmailSnapshot.docs) {
      if (!existingIds.has(doc.id)) {
        bookings.push(docToBooking(doc))
      }
    }

    bookings.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  return bookings
}

export async function getBookingsByExperience(experienceId: string): Promise<Booking[]> {
  const snapshot = await adminDb
    .collection('bookings')
    .where('experienceId', '==', experienceId)
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(docToBooking)
}

export async function getBookingsByExperienceAndDate(
  experienceId: string,
  dateId: string
): Promise<Booking[]> {
  const snapshot = await adminDb
    .collection('bookings')
    .where('experienceId', '==', experienceId)
    .where('dateId', '==', dateId)
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(docToBooking)
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const doc = await adminDb.collection('bookings').doc(bookingId).get()
  if (!doc.exists) return null
  return docToBooking(doc)
}

export async function getBookingsByPaymentIntent(
  paymentIntentId: string
): Promise<Booking[]> {
  const snapshot = await adminDb
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(docToBooking)
}
