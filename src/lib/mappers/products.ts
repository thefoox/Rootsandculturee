import type { Product } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

export function mapProduct(doc: FirestoreDoc): Product {
  const data = doc.data()
  return {
    id: doc.id,
    slug: data.slug as string,
    name: data.name as string,
    description: data.description as string,
    price: data.price as number,
    salePrice: (data.salePrice as number) ?? null,
    category: data.category as Product['category'],
    images: (data.images as Product['images']) || [],
    inStock: data.inStock as boolean,
    stockCount: data.stockCount as number,
    shippingCost: (data.shippingCost as number) ?? 0,
    variants: ((data.variants as Product['variants']) || []).map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      inStock: v.inStock,
      stockCount: v.stockCount,
    })),
    createdAt: (data.createdAt instanceof Date ? data.createdAt : new Date()) as Date,
    updatedAt: (data.updatedAt instanceof Date ? data.updatedAt : new Date()) as Date,
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null,
  }
}
