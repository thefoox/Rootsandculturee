export interface User {
  uid: string
  email: string
  displayName: string
  role: 'customer' | 'admin'
  createdAt: Date
  lastLoginAt: Date
}

export interface SessionPayload {
  uid: string
  email: string
  role: 'customer' | 'admin'
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  error?: string
}

// Phase 2: Product types

export type ProductCategory = 'drikke' | 'kaffe-te' | 'naturprodukter'

export interface ProductImage {
  url: string
  alt: string // Mandatory per WCAG-04 / D-19
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number // NOK in ore (integer)
  category: ProductCategory
  images: ProductImage[]
  inStock: boolean
  stockCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

// Phase 2: Experience types

export type ExperienceCategory = 'retreat' | 'kurs' | 'matopplevelse'
export type Difficulty = 'lett' | 'moderat' | 'krevende'

export interface Experience {
  id: string
  slug: string
  name: string
  description: string
  category: ExperienceCategory
  images: ProductImage[] // Reuses same image+alt structure
  basePrice: number // NOK in ore
  location: string
  durationText: string
  difficulty: Difficulty
  whatIsIncluded: string[]
  cancellationPolicy: string
  whatToBring: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export interface ExperienceDate {
  id: string
  date: Date
  maxSeats: number
  bookedSeats: number
  availableSeats: number
  isActive: boolean
  priceOverride: number | null
}

// Phase 2: Article types

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string // HTML from Tiptap
  coverImage: ProductImage // Mandatory hero image with alt (D-11, WCAG-04)
  author: string
  tags: string[]
  status: 'draft' | 'published'
  metaTitle: string
  metaDescription: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

// Phase 2: Site content

export interface SiteContent {
  id: string
  heroTitle: string
  heroIngress: string
  aboutText: string
  updatedAt: Date
}
