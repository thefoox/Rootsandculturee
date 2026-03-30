'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { experienceSchema } from '@/lib/validations'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Experience, ExperienceDate } from '@/types'

function mapExperience(doc: FirebaseFirestore.DocumentSnapshot): Experience {
  const data = doc.data()!
  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    category: data.category,
    images: data.images || [],
    basePrice: data.basePrice,
    location: data.location,
    durationText: data.durationText,
    difficulty: data.difficulty,
    whatIsIncluded: data.whatIsIncluded || [],
    cancellationPolicy: data.cancellationPolicy || '',
    whatToBring: data.whatToBring || '',
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

function mapExperienceDate(
  doc: FirebaseFirestore.DocumentSnapshot
): ExperienceDate {
  const data = doc.data()!
  return {
    id: doc.id,
    date: data.date?.toDate() ?? new Date(),
    maxSeats: data.maxSeats,
    bookedSeats: data.bookedSeats || 0,
    availableSeats: data.availableSeats || data.maxSeats,
    isActive: data.isActive ?? true,
    priceOverride: data.priceOverride ?? null,
  }
}

export async function getAllExperiences(): Promise<Experience[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection('experiences')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapExperience)
}

export async function getExperienceById(
  id: string
): Promise<Experience | null> {
  if (!adminDb) return null
  const doc = await adminDb.collection('experiences').doc(id).get()
  if (!doc.exists) return null
  return mapExperience(doc)
}

export async function getExperienceDatesAdmin(
  experienceId: string
): Promise<ExperienceDate[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection('experiences')
    .doc(experienceId)
    .collection('dates')
    .orderBy('date', 'asc')
    .get()
  return snapshot.docs.map(mapExperienceDate)
}

export async function createExperience(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawImages = formData.get('images') as string
  const rawDates = formData.get('dates') as string
  const priceNOK = Number(formData.get('basePrice'))
  const whatIsIncludedRaw = (formData.get('whatIsIncluded') as string) || ''

  const parsed = experienceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    basePrice: Math.round(priceNOK * 100),
    location: formData.get('location'),
    durationText: formData.get('durationText'),
    difficulty: formData.get('difficulty'),
    whatIsIncluded: whatIsIncludedRaw,
    cancellationPolicy: (formData.get('cancellationPolicy') as string) || '',
    whatToBring: (formData.get('whatToBring') as string) || '',
    dates: rawDates ? JSON.parse(rawDates) : [],
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
  const docRef = await adminDb.collection('experiences').add({
    ...data,
    whatIsIncluded: data.whatIsIncluded
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    publishedAt: publish ? FieldValue.serverTimestamp() : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Create date subcollection docs
  if (dates && dates.length > 0) {
    const batch = adminDb.batch()
    for (const dateSlot of dates) {
      const dateDocRef = docRef.collection('dates').doc()
      batch.set(dateDocRef, {
        date: Timestamp.fromDate(new Date(dateSlot.date)),
        maxSeats: dateSlot.maxSeats,
        bookedSeats: 0,
        availableSeats: dateSlot.maxSeats,
        isActive: true,
        priceOverride: null,
      })
    }
    await batch.commit()
  }

  revalidateTag('experiences', 'max')
  revalidateTag('experience-dates', 'max')
  return { success: true, id: docRef.id }
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawImages = formData.get('images') as string
  const rawDates = formData.get('dates') as string
  const priceNOK = Number(formData.get('basePrice'))
  const whatIsIncludedRaw = (formData.get('whatIsIncluded') as string) || ''

  const parsed = experienceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    basePrice: Math.round(priceNOK * 100),
    location: formData.get('location'),
    durationText: formData.get('durationText'),
    difficulty: formData.get('difficulty'),
    whatIsIncluded: whatIsIncludedRaw,
    cancellationPolicy: (formData.get('cancellationPolicy') as string) || '',
    whatToBring: (formData.get('whatToBring') as string) || '',
    dates: rawDates ? JSON.parse(rawDates) : [],
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
  const existing = existingDoc.data()

  await adminDb
    .collection('experiences')
    .doc(id)
    .update({
      ...data,
      whatIsIncluded: data.whatIsIncluded
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      publishedAt: publish
        ? existing?.publishedAt || FieldValue.serverTimestamp()
        : null,
      updatedAt: FieldValue.serverTimestamp(),
    })

  // Update dates subcollection: delete all and re-create
  if (dates) {
    const existingDates = await adminDb
      .collection('experiences')
      .doc(id)
      .collection('dates')
      .get()

    const batch = adminDb.batch()
    existingDates.docs.forEach((doc) => batch.delete(doc.ref))

    for (const dateSlot of dates) {
      const dateDocRef = adminDb
        .collection('experiences')
        .doc(id)
        .collection('dates')
        .doc()
      batch.set(dateDocRef, {
        date: Timestamp.fromDate(new Date(dateSlot.date)),
        maxSeats: dateSlot.maxSeats,
        bookedSeats: 0,
        availableSeats: dateSlot.maxSeats,
        isActive: true,
        priceOverride: null,
      })
    }
    await batch.commit()
  }

  revalidateTag('experiences', 'max')
  revalidateTag('experience-dates', 'max')
  return { success: true }
}

export async function deleteExperience(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }
  if (!adminDb) {
    return { success: false, error: 'Server er ikke konfigurert.' }
  }

  // Delete dates subcollection first
  const datesSnapshot = await adminDb
    .collection('experiences')
    .doc(id)
    .collection('dates')
    .get()
  const batch = adminDb.batch()
  datesSnapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()

  // Delete main doc
  await adminDb.collection('experiences').doc(id).delete()
  revalidateTag('experiences', 'max')
  revalidateTag('experience-dates', 'max')
  return { success: true }
}
