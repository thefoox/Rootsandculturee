'use server'

import { adminDb } from '@/lib/firebase/admin'
import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { getBookings, getBookingsByExperience, getBookingsByExperienceAndDate } from '@/lib/data/bookings'
import type { Booking } from '@/types'

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ingen tilgang.' }
  }

  if (!adminDb) {
    return { success: false, error: 'Database ikke tilgjengelig.' }
  }

  try {
    const bookingRef = adminDb.collection('bookings').doc(bookingId)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return { success: false, error: 'Booking ikke funnet.' }
    }

    const bookingData = bookingDoc.data()!
    if (bookingData.status === 'cancelled') {
      return { success: false, error: 'Bookingen er allerede kansellert.' }
    }

    const experienceId = bookingData.experienceId as string
    const dateId = bookingData.dateId as string
    const seats = (bookingData.seats as number) || 1

    // Atomic transaction: cancel booking + reverse seat reservation
    await adminDb.runTransaction(async (transaction) => {
      const dateRef = adminDb!
        .collection('experiences')
        .doc(experienceId)
        .collection('dates')
        .doc(dateId)

      const dateDoc = await transaction.get(dateRef)

      // Update booking status
      transaction.update(bookingRef, { status: 'cancelled' })

      // Reverse seat reservation if date doc exists
      if (dateDoc.exists) {
        const dateData = dateDoc.data()!
        const currentBooked = (dateData.bookedSeats as number) || 0
        const currentAvailable = (dateData.availableSeats as number) || 0

        transaction.update(dateRef, {
          bookedSeats: Math.max(0, currentBooked - seats),
          availableSeats: currentAvailable + seats,
        })
      }
    })

    revalidateTag('bookings', 'max')
    revalidateTag('experience-dates', 'max')
    return { success: true }
  } catch {
    return { success: false, error: 'Kunne ikke kansellere. Prov igjen.' }
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
