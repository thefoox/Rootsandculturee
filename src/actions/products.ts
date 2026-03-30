'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { productSchema } from '@/lib/validations'
import { FieldValue } from 'firebase-admin/firestore'
import type { Product } from '@/types'

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
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection('products')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!adminDb) return null
  const doc = await adminDb.collection('products').doc(id).get()
  if (!doc.exists) return null
  return mapProduct(doc)
}

export async function createProduct(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    stockCount: Number(formData.get('stockCount')),
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, ...data } = parsed.data
  const docRef = await adminDb.collection('products').add({
    ...data,
    inStock: data.stockCount > 0,
    publishedAt: publish ? FieldValue.serverTimestamp() : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  revalidateTag('products', 'max')
  return { success: true, id: docRef.id }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    category: formData.get('category'),
    images: rawImages ? JSON.parse(rawImages) : [],
    stockCount: Number(formData.get('stockCount')),
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  const { publish, ...data } = parsed.data
  const existingDoc = await adminDb.collection('products').doc(id).get()
  const existing = existingDoc.data()

  await adminDb
    .collection('products')
    .doc(id)
    .update({
      ...data,
      inStock: data.stockCount > 0,
      publishedAt: publish
        ? existing?.publishedAt || FieldValue.serverTimestamp()
        : null,
      updatedAt: FieldValue.serverTimestamp(),
    })

  revalidateTag('products', 'max')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }
  if (!adminDb) {
    return { success: false, error: 'Server er ikke konfigurert.' }
  }

  await adminDb.collection('products').doc(id).delete()
  revalidateTag('products', 'max')
  return { success: true }
}
