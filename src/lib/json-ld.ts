import type { Product, Experience } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rootsculture.no'

export function productJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0]?.url
      ? `${BASE_URL}${product.images[0].url}`
      : undefined,
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'NOK',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }
}

export function experienceJsonLd(experience: Experience) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: experience.name,
    description: experience.description,
    image: experience.images[0]?.url
      ? `${BASE_URL}${experience.images[0].url}`
      : undefined,
    location: {
      '@type': 'Place',
      name: experience.location,
    },
    offers: {
      '@type': 'Offer',
      price: (experience.basePrice / 100).toFixed(2),
      priceCurrency: 'NOK',
      availability: 'https://schema.org/InStock',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Roots & Culture',
      url: BASE_URL,
    },
  }
}
