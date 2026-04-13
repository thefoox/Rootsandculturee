'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { experienceSchema } from '@/lib/validations'
import { mapExperience, mapExperienceDate } from '@/lib/mappers/experiences'
import type { ActionResult, Experience, ExperienceDate } from '@/types'

export async function getAllExperiences(): Promise<Experience[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

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
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

  const snapshot = await adminDb
    .collection(`experiences/${experienceId}/dates`)
    .orderBy('date', 'asc')
    .get()
  return snapshot.docs.map(mapExperienceDate)
}

export async function createExperience(formData: FormData): Promise<ActionResult<{ id: string }>> {
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

  // Check slug uniqueness
  const existingSlug = await adminDb
    .collection('experiences')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlug.empty) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
  }

  const { publish, dates, ...data } = parsed.data
  const now = new Date()

  try {
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
    return { success: true, data: { id: docRef.id } }
  } catch (err) {
    console.error('[createExperience] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke opprette opplevelsen. Prøv igjen.' } }
  }
}

export async function updateExperience(id: string, formData: FormData): Promise<ActionResult> {
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

  // Check slug uniqueness (exclude current document)
  const existingSlugUpdate = await adminDb
    .collection('experiences')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlugUpdate.empty && existingSlugUpdate.docs[0].id !== id) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
  }

  const { publish, dates, ...data } = parsed.data
  const existingDoc = await adminDb.collection('experiences').doc(id).get()
  if (!existingDoc.exists) {
    return { success: false, errors: { _form: 'Opplevelsen ble ikke funnet.' } }
  }
  const existing = existingDoc.data()
  const now = new Date()

  try {
    await adminDb.collection('experiences').doc(id).update({
      ...data,
      whatIsIncluded: data.whatIsIncluded
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      publishedAt: publish
        ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
        : (existing.publishedAt instanceof Date ? existing.publishedAt : null),
      updatedAt: now,
    })
  } catch (err) {
    console.error('[updateExperience] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke oppdatere opplevelsen. Prøv igjen.' } }
  }

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

export async function deleteExperience(id: string): Promise<ActionResult> {
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
