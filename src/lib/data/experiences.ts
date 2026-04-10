import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Experience, ExperienceDate } from '@/types'
import { mockExperiences, mockExperienceDates } from '@/lib/data/mock-data'
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
    bookedSeats: data.bookedSeats as number,
    availableSeats: data.availableSeats as number,
    isActive: data.isActive as boolean,
    priceOverride: (data.priceOverride as number) ?? null,
    earlyBirdPrice: (data.earlyBirdPrice as number) ?? null,
    earlyBirdDeadline: data.earlyBirdDeadline instanceof Date ? data.earlyBirdDeadline : null,
  }
}

const _getExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    const snapshot = await adminDb
      .collection('experiences')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    return snapshot.docs.map(mapExperience)
  },
  ['experiences'],
  { revalidate: 3600, tags: ['experiences'] }
)

export async function getExperiences(): Promise<Experience[]> {
  try {
    return await _getExperiences()
  } catch (e) {
    console.warn('getExperiences failed:', e)
    return mockExperiences
  }
}

const _getExperienceBySlug = unstable_cache(
  async (slug: string): Promise<Experience | null> => {
    const snapshot = await adminDb
      .collection('experiences')
      .where('slug', '==', slug)
      .where('publishedAt', '!=', null)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return mapExperience(snapshot.docs[0])
  },
  ['experiences'],
  { revalidate: 3600, tags: ['experiences'] }
)

export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  try {
    return await _getExperienceBySlug(slug)
  } catch (e) {
    console.warn('getExperienceBySlug failed:', e)
    return mockExperiences.find((e) => e.slug === slug) ?? null
  }
}

const _getExperienceDates = unstable_cache(
  async (experienceId: string): Promise<ExperienceDate[]> => {
    const now = new Date()
    const snapshot = await adminDb
      .collection(`experiences/${experienceId}/dates`)
      .where('isActive', '==', true)
      .where('date', '>=', now)
      .orderBy('date', 'asc')
      .get()
    return snapshot.docs.map(mapExperienceDate)
  },
  ['experience-dates'],
  { revalidate: 60, tags: ['experience-dates'] }
)

export async function getExperienceDates(experienceId: string): Promise<ExperienceDate[]> {
  try {
    return await _getExperienceDates(experienceId)
  } catch (e) {
    console.warn('getExperienceDates failed:', e)
    return mockExperienceDates.get(experienceId) ?? []
  }
}
