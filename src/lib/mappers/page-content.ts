import type { PageContent, PageSection } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

export function mapPageContent(doc: FirestoreDoc): PageContent {
  const data = doc.data()
  return {
    id: doc.id,
    title: (data.title as string) || '',
    slug: (data.slug as string) || doc.id,
    isPublished: (data.isPublished as boolean) ?? true,
    showInNavigation: (data.showInNavigation as boolean) ?? false,
    navigationOrder: (data.navigationOrder as number) ?? 0,
    sections: ((data.sections as Record<string, unknown>[]) || []).map((s, i) => ({
      id: (s.id as string) || `section-${i}`,
      type: (s.type as string) || 'text',
      heading: (s.heading as string) || undefined,
      subheading: (s.subheading as string) || undefined,
      body: (s.body as string) || undefined,
      image: (s.image as { url?: string } | null)?.url ? s.image : undefined,
      imagePosition: (s.imagePosition as 'left' | 'right') || undefined,
      items: s.items || undefined,
      ctaText: (s.ctaText as string) || undefined,
      ctaLink: (s.ctaLink as string) || undefined,
      ctaSecondaryText: (s.ctaSecondaryText as string) || undefined,
      ctaSecondaryLink: (s.ctaSecondaryLink as string) || undefined,
      order: typeof s.order === 'number' ? s.order : i,
    })) as PageSection[],
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
  }
}
