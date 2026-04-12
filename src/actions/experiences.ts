'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { experienceSchema } from '@/lib/validations'
import type { Experience, ExperienceDate } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function mapExperience(doc: FirestoreDoc): Experience {
  const data = doc.data()
  return {
    id: doc.id,
    slug: data.slug as string,
    name: data.name as string,
    description: data.description as string,
    category: data.category as Experience['category'],
    images: (data.images as Experience['images']) || [],
    basePrice: data.basePrice as number,
    location: data.location as string,
    locationLat: (data.locationLat as number) ?? null,
    locationLng: (data.locationLng as number) ?? null,
    durationText: data.durationText as string,
    whatIsIncluded: (data.whatIsIncluded as string[]) || [],
    cancellationPolicy: (data.cancellationPolicy as string) || '',
    whatToBring: (data.whatToBring as string) || '',
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null,
  }
}

function mapExperienceDate(doc: FirestoreDoc): ExperienceDate {
  const data = doc.data()
  return {
    id: doc.id,
    date: data.date instanceof Date ? data.date : new Date(),
    maxSeats: data.maxSeats as number,
    bookedSeats: (data.bookedSeats as number) || 0,
    availableSeats: (data.availableSeats as number) || (data.maxSeats as number),
    isActive: (data.isActive as boolean) ?? true,
    priceOverride: (data.priceOverride as number) ?? null,
    earlyBirdPrice: (data.earlyBirdPrice as number) ?? null,
    earlyBirdDeadline: data.earlyBirdDeadline instanceof Date ? data.earlyBirdDeadline : null,
  }
}

export async function getAllExperiences(): Promise<Experience[]> {
  const snapshot = await adminDb
    .collection('experiences')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapExperience)
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const doc = await adminDb.collection('experiences').doc(id).get()
  if (!doc.exists) return null
  return mapExperience(doc)
}

export async function getExperienceDatesAdmin(experienceId: string): Promise<ExperienceDate[]> {
  const snapshot = await adminDb
    .collection(`experiences/${experienceId}/dates`)
    .orderBy('date', 'asc')
    .get()
  return snapshot.docs.map(mapExperienceDate)
}

export async function createExperience(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const rawDates = formData.get('dates') as string
  const priceNOK = Number(formData.get('basePrice'))
  const whatIsIncludedRaw = (formData.get('whatIsIncluded') as string) || ''

  let parsedImages: unknown[]
  try {
    parsedImages = rawImages ? JSON.parse(rawImages) : []
  } catch {
    return { success: false, errors: { images: 'Ugyldig bildedata.' } }
  }

  let parsedDates: unknown[]
  try {
    parsedDates = rawDates ? JSON.parse(rawDates) : []
  } catch {
    return { success: false, errors: { dates: 'Ugyldig datodata.' } }
  }

  const parsed = experienceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category: formData.get('category'),
    images: parsedImages,
    basePrice: Math.round(priceNOK * 100),
    location: formData.get('location'),
    durationText: formData.get('durationText'),
    whatIsIncluded: whatIsIncludedRaw,
    cancellationPolicy: (formData.get('cancellationPolicy') as string) || '',
    whatToBring: (formData.get('whatToBring') as string) || '',
    dates: parsedDates,
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, dates, ...data } = parsed.data
  const now = new Date()
  const docRef = await adminDb.collection('experiences').add({
    ...data,
    whatIsIncluded: data.whatIsIncluded
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    publishedAt: publish ? now : null,
    createdAt: now,
    updatedAt: now,
  })

  // Create date subcollection docs
  if (dates && dates.length > 0) {
    const batch = adminDb.batch()
    for (const dateSlot of dates) {
      const ebPrice = dateSlot.earlyBirdPrice ? Math.round(Number(dateSlot.earlyBirdPrice) * 100) : null
      const ebDeadline = dateSlot.earlyBirdDeadline ? new Date(dateSlot.earlyBirdDeadline) : null
      const dateDocRef = docRef.collection(`dates`).doc()
      batch.set(dateDocRef, {
        date: new Date(dateSlot.date),
        maxSeats: dateSlot.maxSeats,
        bookedSeats: 0,
        availableSeats: dateSlot.maxSeats,
        isActive: true,
        priceOverride: null,
        earlyBirdPrice: ebPrice,
        earlyBirdDeadline: ebDeadline,
      })
    }
    await batch.commit()
  }

  revalidateTag('experiences')
  revalidateTag('experience-dates')
  return { success: true, id: docRef.id }
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const rawDates = formData.get('dates') as string
  const priceNOK = Number(formData.get('basePrice'))
  const whatIsIncludedRaw = (formData.get('whatIsIncluded') as string) || ''

  let parsedImages: unknown[]
  try {
    parsedImages = rawImages ? JSON.parse(rawImages) : []
  } catch {
    return { success: false, errors: { images: 'Ugyldig bildedata.' } }
  }

  let parsedDates: unknown[]
  try {
    parsedDates = rawDates ? JSON.parse(rawDates) : []
  } catch {
    return { success: false, errors: { dates: 'Ugyldig datodata.' } }
  }

  const parsed = experienceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category: formData.get('category'),
    images: parsedImages,
    basePrice: Math.round(priceNOK * 100),
    location: formData.get('location'),
    durationText: formData.get('durationText'),
    whatIsIncluded: whatIsIncludedRaw,
    cancellationPolicy: (formData.get('cancellationPolicy') as string) || '',
    whatToBring: (formData.get('whatToBring') as string) || '',
    dates: parsedDates,
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, dates, ...data } = parsed.data
  const existingDoc = await adminDb.collection('experiences').doc(id).get()
  if (!existingDoc.exists) {
    return { success: false, errors: { _form: 'Opplevelsen ble ikke funnet.' } }
  }
  const existing = existingDoc.data()
  const now = new Date()

  await adminDb.collection('experiences').doc(id).update({
    ...data,
    whatIsIncluded: data.whatIsIncluded
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    publishedAt: publish
      ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
      : null,
    updatedAt: now,
  })

  // Update dates subcollection: merge to preserve existing booking counts
  if (dates) {
    const existingDatesSnap = await adminDb
      .collection(`experiences/${id}/dates`)
      .get()

    // Build lookup map: ISO date string → { docId, bookedSeats }
    const existingByDate = new Map<string, { docId: string; bookedSeats: number }>()
    for (const doc of existingDatesSnap.docs) {
      const d = doc.data()
      const dateVal = d.date instanceof Date ? d.date : null
      const isoDate = dateVal?.toISOString() ?? ''
      existingByDate.set(isoDate, { docId: doc.id, bookedSeats: (d.bookedSeats as number) || 0 })
    }

    const incomingIsoDates = new Set<string>()
    const batch = adminDb.batch()

    for (const dateSlot of dates) {
      const isoDate = new Date(dateSlot.date).toISOString()
      incomingIsoDates.add(isoDate)

      const ebPrice = dateSlot.earlyBirdPrice
        ? Math.round(Number(dateSlot.earlyBirdPrice) * 100)
        : null
      const ebDeadline = dateSlot.earlyBirdDeadline
        ? new Date(dateSlot.earlyBirdDeadline)
        : null

      const existingEntry = existingByDate.get(isoDate)
      const bookedSeats = existingEntry?.bookedSeats ?? 0
      const availableSeats = Math.max(0, dateSlot.maxSeats - bookedSeats)

      const dateDocRef = existingEntry
        ? adminDb.collection(`experiences/${id}/dates`).doc(existingEntry.docId)
        : adminDb.collection(`experiences/${id}/dates`).doc()

      batch.set(dateDocRef, {
        date: new Date(dateSlot.date),
        maxSeats: dateSlot.maxSeats,
        bookedSeats,
        availableSeats,
        isActive: true,
        priceOverride: null,
        earlyBirdPrice: ebPrice,
        earlyBirdDeadline: ebDeadline,
      })
    }

    // Delete dates that were removed from the form
    for (const [isoDate, { docId }] of existingByDate.entries()) {
      if (!incomingIsoDates.has(isoDate)) {
        batch.delete(adminDb.collection(`experiences/${id}/dates`).doc(docId))
      }
    }

    await batch.commit()
  }

  revalidateTag('experiences')
  revalidateTag('experience-dates')
  return { success: true }
}

export async function deleteExperience(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  // Delete dates subcollection first
  const datesSnapshot = await adminDb
    .collection(`experiences/${id}/dates`)
    .get()
  const batch = adminDb.batch()
  datesSnapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()

  // Delete main doc
  await adminDb.collection('experiences').doc(id).delete()
  revalidateTag('experiences')
  revalidateTag('experience-dates')
  return { success: true }
}
