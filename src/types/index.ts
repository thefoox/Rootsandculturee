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

// Phase 2: Site content (legacy — kept for backward compat)

export interface SiteContent {
  id: string
  heroTitle: string
  heroIngress: string
  aboutText: string
  updatedAt: Date
}

// CMS Page Content

export type SectionType = 'hero' | 'text-image' | 'text' | 'values' | 'team' | 'faq' | 'cta' | 'gallery' | 'contact-info'

export interface SectionItem {
  title: string
  description: string
  image?: ProductImage
  icon?: string
  href?: string
}

export interface PageSection {
  id: string
  type: SectionType
  heading?: string
  subheading?: string
  body?: string
  image?: ProductImage
  items?: SectionItem[]
  ctaText?: string
  ctaLink?: string
  order: number
}

export interface PageContent {
  id: string
  title: string
  sections: PageSection[]
  updatedAt: Date
}

// Phase 3: Cart types
export type CartItemType = 'product' | 'experience'

export interface CartItem {
  id: string              // product ID or experience ID
  type: CartItemType
  name: string
  price: number           // NOK in ore -- snapshot at add time
  quantity: number         // Always 1 for experiences (per D-11)
  image: ProductImage | null
  slug: string
  // Experience-specific fields (null for products)
  experienceDateId: string | null
  experienceDate: string | null    // ISO string of the date
  experienceName: string | null
}

// Phase 3: Order types
export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number           // ore, snapshot
  quantity: number
  image: ProductImage | null
}

export interface ShippingAddress {
  fullName: string
  address: string
  postalCode: string
  city: string
}

export interface Order {
  id: string
  stripeSessionId: string
  stripePaymentIntentId: string
  customerId: string | null       // Firebase UID, null for guest
  customerEmail: string
  status: OrderStatus
  items: OrderItem[]
  shipping: ShippingAddress | null  // null if only bookings
  subtotal: number                  // ore
  shippingCost: number              // ore
  total: number                     // ore
  createdAt: Date
  paidAt: Date | null
  fulfilledAt: Date | null
}

// Phase 3: Booking types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  confirmationCode: string
  stripeSessionId: string
  customerId: string | null
  customerEmail: string
  customerName: string
  experienceId: string
  experienceName: string
  dateId: string
  date: Date
  seats: number
  pricePerSeat: number       // ore, snapshot
  total: number               // ore
  whatToBring: string
  status: BookingStatus
  createdAt: Date
  confirmedAt: Date | null
}

// Phase 3: Shipping config
export interface ShippingConfig {
  flatRate: number  // ore -- admin-configurable stored in siteContent
}
