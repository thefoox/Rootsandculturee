import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Experience, ExperienceDate } from '@/types'
import { mockExperiences, mockExperienceDates } from '@/lib/data/mock-data'

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
    locationLat: data.locationLat ?? null,
    locationLng: data.locationLng ?? null,
    durationText: data.durationText,
    whatIsIncluded: data.whatIsIncluded || [],
    cancellationPolicy: data.cancellationPolicy || '',
    whatToBring: data.whatToBring || '',
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

function mapExperienceDate(doc: FirebaseFirestore.DocumentSnapshot): ExperienceDate {
  const data = doc.data()!
  return {
    id: doc.id,
    date: data.date?.toDate() ?? new Date(),
    maxSeats: data.maxSeats,
    bookedSeats: data.bookedSeats,
    availableSeats: data.availableSeats,
    isActive: data.isActive,
    priceOverride: data.priceOverride ?? null,
    earlyBirdPrice: data.earlyBirdPrice ?? null,
    earlyBirdDeadline: data.earlyBirdDeadline?.toDate() ?? null,
  }
}

const _getExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    const snapshot = await adminDb!
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
  if (!adminDb) {
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    return mockExperiences
  }
  try {
    return await _getExperiences()
  } catch (e) {
    console.warn('getExperiences failed:', e)
    return []
  }
}

const _getExperienceBySlug = unstable_cache(
  async (slug: string): Promise<Experience | null> => {
    const snapshot = await adminDb!
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
  if (!adminDb) {
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    return mockExperiences.find((e) => e.slug === slug) ?? null
  }
  try {
    return await _getExperienceBySlug(slug)
  } catch (e) {
    console.warn('getExperienceBySlug failed:', e)
    return null
  }
}

const _getExperienceDates = unstable_cache(
  async (experienceId: string): Promise<ExperienceDate[]> => {
    const now = new Date()
    const snapshot = await adminDb!
      .collection('experiences')
      .doc(experienceId)
      .collection('dates')
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
  if (!adminDb) {
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    return mockExperienceDates.get(experienceId) ?? []
  }
  try {
    return await _getExperienceDates(experienceId)
  } catch (e) {
    console.warn('getExperienceDates failed:', e)
    return []
  }
}
