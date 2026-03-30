import { z } from 'zod'

// Shared image schema -- alt is always required (WCAG-04, D-19)
export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1, 'Alt-tekst er pakrevd for alle bilder.'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Dette feltet er pakrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er pakrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  description: z.string().min(1, 'Dette feltet er pakrevd.'),
  price: z.number().int().positive('Pris ma vaere et positivt tall.'),
  category: z.enum(['drikke', 'kaffe-te', 'naturprodukter']),
  images: z.array(imageSchema).min(1, 'Minst ett bilde er pakrevd.'),
  stockCount: z.number().int().min(0),
  publish: z.boolean().optional(),
})

export const experienceSchema = z.object({
  name: z.string().min(1, 'Dette feltet er pakrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er pakrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  description: z.string().min(1, 'Dette feltet er pakrevd.'),
  category: z.enum(['retreat', 'kurs', 'matopplevelse']),
  images: z.array(imageSchema).min(1, 'Minst ett bilde er pakrevd.'),
  basePrice: z.number().int().positive(),
  location: z.string().min(1, 'Dette feltet er pakrevd.'),
  durationText: z.string().min(1, 'Dette feltet er pakrevd.'),
  difficulty: z.enum(['lett', 'moderat', 'krevende']),
  whatIsIncluded: z.string(),
  cancellationPolicy: z.string(),
  whatToBring: z.string(),
  dates: z
    .array(
      z.object({
        date: z.string().min(1, 'Dato er pakrevd.'),
        maxSeats: z
          .number()
          .int()
          .positive('Plasser ma vaere et positivt tall.'),
      })
    )
    .optional(),
  publish: z.boolean().optional(),
})

export const articleSchema = z.object({
  title: z.string().min(1, 'Dette feltet er pakrevd.').max(200),
  slug: z
    .string()
    .min(1, 'Dette feltet er pakrevd.')
    .regex(/^[a-z0-9-]+$/, 'Kun bokstaver, tall og bindestreker.'),
  excerpt: z.string().max(300).optional(),
  body: z.string().min(1, 'Artikkelinnhold er pakrevd.'),
  coverImage: imageSchema,
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  publish: z.boolean().optional(),
})

export const siteContentSchema = z.object({
  heroTitle: z.string().min(1, 'Dette feltet er pakrevd.'),
  heroIngress: z.string().min(1, 'Dette feltet er pakrevd.'),
  aboutText: z.string().min(1, 'Dette feltet er pakrevd.'),
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
