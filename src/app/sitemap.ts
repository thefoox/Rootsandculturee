import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/data/products'
import { getExperiences } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rootsculture.no'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, experiences, articles] = await Promise.all([
    getProducts(),
    getExperiences(),
    getArticles(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/produkter`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/opplevelser`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blogg`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kontakt`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/produkter/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const experiencePages: MetadataRoute.Sitemap = experiences.map((e) => ({
    url: `${BASE_URL}/opplevelser/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/blogg/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt || undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...experiencePages, ...articlePages]
}
