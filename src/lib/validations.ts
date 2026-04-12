import { z } from 'zod'

// Shared image schema -- alt is always required (WCAG-04, D-19)
export const imageSchema = z.object({
  url: z.string().min(1, 'Bilde-URL er påkrevd.'),
  alt: z.string().min(1, 'Alt-tekst er påkrevd for alle bilder.'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Dette feltet er påkrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er påkrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  description: z.string().min(1, 'Dette feltet er påkrevd.'),
  price: z.number().int().positive('Pris må være et positivt tall.'),
  category: z.enum(['drikke', 'kaffe-te', 'naturprodukter']),
  images: z.array(imageSchema).min(1, 'Minst ett bilde er påkrevd.'),
  stockCount: z.number().int().min(0),
  shippingCost: z.number().int().min(0).default(0),
  publish: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Variantnavn er påkrevd.'),
        price: z.number().positive('Variantpris må være positiv.'),
        inStock: z.boolean().optional().default(true),
        stockCount: z.number().int().min(0).default(0),
      })
    )
    .optional()
    .default([]),
})

export const experienceSchema = z.object({
  name: z.string().min(1, 'Dette feltet er påkrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er påkrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  description: z.string().min(1, 'Dette feltet er påkrevd.'),
  category: z.enum(['retreat', 'kurs', 'matopplevelse']),
  images: z.array(imageSchema).min(1, 'Minst ett bilde er påkrevd.'),
  basePrice: z.number().int().positive(),
  location: z.string().min(1, 'Dette feltet er påkrevd.'),
  durationText: z.string().min(1, 'Dette feltet er påkrevd.'),
  whatIsIncluded: z.string(),
  cancellationPolicy: z.string(),
  whatToBring: z.string(),
  dates: z
    .array(
      z.object({
        date: z.string().min(1, 'Dato er påkrevd.'),
        maxSeats: z
          .number()
          .int()
          .positive('Plasser må være et positivt tall.'),
        earlyBirdPrice: z.string().optional(),
        earlyBirdDeadline: z.string().optional(),
      })
    )
    .optional(),
  publish: z.boolean().optional(),
})

export const articleSchema = z.object({
  title: z.string().min(1, 'Dette feltet er påkrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er påkrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  excerpt: z.string().max(300).optional(),
  body: z.string().min(1, 'Artikkelinnhold er påkrevd.'),
  coverImage: imageSchema.optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  publish: z.boolean().optional(),
})

export const siteContentSchema = z.object({
  heroTitle: z.string().min(1, 'Dette feltet er påkrevd.'),
  heroIngress: z.string().min(1, 'Dette feltet er påkrevd.'),
  aboutText: z.string().min(1, 'Dette feltet er påkrevd.'),
})

// -- Page Content schemas (CMS API validation) --

const sectionTypeValues = [
  'hero', 'text-image', 'text', 'values', 'team', 'faq', 'cta', 'gallery',
  'contact-info', 'experiences-grid', 'articles-grid', 'products-grid',
  'trust-bar', 'location', 'testimonials', 'newsletter', 'categories',
  'video', 'stats', 'logo-bar',
] as const

export const pageSectionSchema = z.object({
  id: z.string().min(1, 'Seksjons-ID er påkrevd.'),
  type: z.enum(sectionTypeValues, { message: 'Ugyldig seksjonstype.' }),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  image: imageSchema.optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  items: z.array(z.object({
    title: z.string().default(''),
    description: z.string().default(''),
    icon: z.string().optional(),
    image: imageSchema.optional(),
  })).optional(),
})

export const pageContentCreateSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd.').max(200),
  slug: z.string().min(1, 'Slug er påkrevd.').regex(/^[a-z0-9-/]+$/, 'Slug kan kun inneholde små bokstaver, tall, bindestreker og skråstrek.'),
})

export const pageContentUpdateSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd.').max(200),
  slug: z.string().min(1, 'Slug er påkrevd.'),
  isPublished: z.boolean(),
  showInNavigation: z.boolean(),
  navigationOrder: z.number().int().min(0),
  sections: z.array(pageSectionSchema),
})

// Auto-generate slug from name/title
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
