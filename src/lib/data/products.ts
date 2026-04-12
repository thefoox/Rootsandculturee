import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Product, ProductCategory } from '@/types'
import { mockProducts } from '@/lib/data/mock-data'
import { mapProduct } from '@/lib/mappers/products'

const _getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const snapshot = await adminDb
      .collection('products')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    return snapshot.docs.map(mapProduct)
  },
  ['products'],
  { revalidate: 3600, tags: ['products'] }
)

export async function getProducts(): Promise<Product[]> {
  try {
    return await _getProducts()
  } catch (e) {
    console.error('[getProducts] Firestore query failed, returning mock data:', e)
    return mockProducts
  }
}

const _getProductsByCategory = unstable_cache(
  async (category: ProductCategory): Promise<Product[]> => {
    const snapshot = await adminDb
      .collection('products')
      .where('publishedAt', '!=', null)
      .where('category', '==', category)
      .orderBy('publishedAt', 'desc')
      .get()
    return snapshot.docs.map(mapProduct)
  },
  ['products'],
  { revalidate: 3600, tags: ['products'] }
)

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  try {
    return await _getProductsByCategory(category)
  } catch (e) {
    console.error('[getProductsByCategory] Firestore query failed, returning mock data:', e)
    return mockProducts.filter((p) => p.category === category)
  }
}

const _getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const snapshot = await adminDb
      .collection('products')
      .where('slug', '==', slug)
      .where('publishedAt', '!=', null)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return mapProduct(snapshot.docs[0])
  },
  ['products'],
  { revalidate: 3600, tags: ['products'] }
)

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await _getProductBySlug(slug)
  } catch (e) {
    console.error('[getProductBySlug] Firestore query failed:', e)
    return null
  }
}
