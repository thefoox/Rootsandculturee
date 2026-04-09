import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Product, ProductCategory } from '@/types'
import { mockProducts } from '@/lib/data/mock-data'

function mapProduct(doc: FirebaseFirestore.DocumentSnapshot): Product {
  const data = doc.data()!
  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    images: data.images || [],
    inStock: data.inStock,
    stockCount: data.stockCount,
    variants: (data.variants || []).map((v: { id: string; label: string; price: number; inStock: boolean; stockCount: number }) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      inStock: v.inStock,
      stockCount: v.stockCount,
    })),
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

const _getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const snapshot = await adminDb!
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
  if (!adminDb) return mockProducts
  try {
    return await _getProducts()
  } catch (e) {
    console.warn('getProducts failed:', e)
    return mockProducts
  }
}

const _getProductsByCategory = unstable_cache(
  async (category: ProductCategory): Promise<Product[]> => {
    const snapshot = await adminDb!
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
  if (!adminDb) return mockProducts.filter((p) => p.category === category)
  try {
    return await _getProductsByCategory(category)
  } catch (e) {
    console.warn('getProductsByCategory failed:', e)
    return mockProducts.filter((p) => p.category === category)
  }
}

const _getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const snapshot = await adminDb!
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
  if (!adminDb) {
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    return mockProducts.find((p) => p.slug === slug) ?? null
  }
  try {
    return await _getProductBySlug(slug)
  } catch (e) {
    console.warn('getProductBySlug failed:', e)
    return null
  }
}
