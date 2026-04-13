import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Experience, ExperienceDate } from '@/types'
import { mapExperience, mapExperienceDate } from '@/lib/mappers/experiences'

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
    console.error('[getExperiences] Firestore query failed:', e)
    return []
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
    console.error('[getExperienceBySlug] Firestore query failed:', e)
    return null
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
    console.error('[getExperienceDates] Firestore query failed:', e)
    return []
  }
}
