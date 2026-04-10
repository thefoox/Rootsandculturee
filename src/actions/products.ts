'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { productSchema } from '@/lib/validations'
import type { Product } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function mapProduct(doc: FirestoreDoc): Product {
  const data = doc.data()
  return {
    id: doc.id,
    slug: data.slug as string,
    name: data.name as string,
    description: data.description as string,
    price: data.price as number,
    category: data.category as Product['category'],
    images: (data.images as Product['images']) || [],
    inStock: data.inStock as boolean,
    stockCount: data.stockCount as number,
    variants: ((data.variants as Product['variants']) || []).map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      inStock: v.inStock,
      stockCount: v.stockCount,
    })),
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await adminDb
    .collection('products')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await adminDb.collection('products').doc(id).get()
  if (!doc.exists) return null
  return mapProduct(doc)
}

export async function createProduct(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))
  const rawVariants = formData.get('variants') as string

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    stockCount: Number(formData.get('stockCount')),
    publish: formData.get('publish') === 'true',
    variants: rawVariants ? JSON.parse(rawVariants) : [],
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, variants, ...data } = parsed.data
  const mappedVariants = (variants || []).map((v) => ({
    id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: v.label,
    price: Math.round(v.price * 100),
    inStock: v.stockCount > 0,
    stockCount: v.stockCount,
  }))

  const now = new Date()
  const docRef = await adminDb.collection('products').add({
    ...data,
    variants: mappedVariants,
    inStock: data.stockCount > 0,
    publishedAt: publish ? now : null,
    createdAt: now,
    updatedAt: now,
  })

  revalidateTag('products', 'max')
  return { success: true, id: docRef.id }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))
  const rawVariants = formData.get('variants') as string

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    stockCount: Number(formData.get('stockCount')),
    publish: formData.get('publish') === 'true',
    variants: rawVariants ? JSON.parse(rawVariants) : [],
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, variants, ...data } = parsed.data
  const mappedVariants = (variants || []).map((v) => ({
    id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: v.label,
    price: Math.round(v.price * 100),
    inStock: v.stockCount > 0,
    stockCount: v.stockCount,
  }))

  const existingDoc = await adminDb.collection('products').doc(id).get()
  const existing = existingDoc.data()
  const now = new Date()

  await adminDb.collection('products').doc(id).update({
    ...data,
    variants: mappedVariants,
    inStock: data.stockCount > 0,
    publishedAt: publish
      ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
      : null,
    updatedAt: now,
  })

  revalidateTag('products', 'max')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  await adminDb.collection('products').doc(id).delete()
  revalidateTag('products', 'max')
  return { success: true }
}
