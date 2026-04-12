import type { Experience, ExperienceDate } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

export function mapExperience(doc: FirestoreDoc): Experience {
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

export function mapExperienceDate(doc: FirestoreDoc): ExperienceDate {
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
