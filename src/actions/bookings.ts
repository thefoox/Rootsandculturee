'use server'

import { adminDb } from '@/lib/firebase/admin'
import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { getBookings, getBookingsByExperience, getBookingsByExperienceAndDate, getBookingsByPaymentIntent } from '@/lib/data/bookings'
import type { Booking } from '@/types'
import type { DocRef } from '@/lib/firebase/firestore-rest'

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }

  try {
    const bookingDocRef = adminDb.collection('bookings').doc(bookingId) as unknown as DocRef
    const bookingDoc = await bookingDocRef.get()

    if (!bookingDoc.exists) {
      return { success: false, error: 'Booking ikke funnet.' }
    }

    const bookingData = bookingDoc.data()
    if (bookingData.status === 'cancelled') {
      return { success: false, error: 'Bookingen er allerede kansellert.' }
    }

    const experienceId = bookingData.experienceId as string
    const dateId = bookingData.dateId as string
    const seats = (bookingData.seats as number) || 1

    const dateDocRef = adminDb
      .collection(`experiences/${experienceId}/dates`)
      .doc(dateId) as unknown as DocRef

    // Atomic transaction: cancel booking + reverse seat reservation
    await adminDb.runTransaction(async (tx) => {
      const dateDoc = await tx.get(dateDocRef)

      // Update booking status
      tx.update(bookingDocRef, { status: 'cancelled' })

      // Reverse seat reservation if date doc exists
      if (dateDoc.exists) {
        const dateData = dateDoc.data()
        const currentBooked = (dateData.bookedSeats as number) || 0
        const currentAvailable = (dateData.availableSeats as number) || 0

        tx.update(dateDocRef, {
          bookedSeats: Math.max(0, currentBooked - seats),
          availableSeats: currentAvailable + seats,
        })
      }
    })

    revalidateTag('bookings', 'max')
    revalidateTag('experience-dates', 'max')
    return { success: true }
  } catch {
    return { success: false, error: 'Kunne ikke kansellere. Prøv igjen.' }
  }
}

export async function getBookingsFiltered(
  experienceId?: string,
  dateId?: string
): Promise<Booking[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return []
  }

  if (experienceId && dateId) {
    return getBookingsByExperienceAndDate(experienceId, dateId)
  }
  if (experienceId) {
    return getBookingsByExperience(experienceId)
  }
  return getBookings()
}

export async function getBookingsByPaymentIntentAction(
  paymentIntentId: string
): Promise<Booking[]> {
  return getBookingsByPaymentIntent(paymentIntentId)
}
