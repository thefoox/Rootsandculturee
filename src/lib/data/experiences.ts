import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
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
  }
}

export const getExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    if (!adminDb) return []

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

export const getExperienceBySlug = unstable_cache(
  async (slug: string): Promise<Experience | null> => {
    if (!adminDb) return null

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

export const getExperienceDates = unstable_cache(
  async (experienceId: string): Promise<ExperienceDate[]> => {
    if (!adminDb) return []

    const now = new Date()
    const snapshot = await adminDb
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
