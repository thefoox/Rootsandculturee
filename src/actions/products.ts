'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { productSchema } from '@/lib/validations'
import { mapProduct } from '@/lib/mappers/products'
import type { ActionResult, Product } from '@/types'

export async function getAllProducts(): Promise<Product[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

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

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))
  const salePriceNOK = formData.get('salePrice') ? Number(formData.get('salePrice')) : null
  const rawVariants = formData.get('variants') as string

  let parsedImages: unknown[]
  try {
    parsedImages = rawImages ? JSON.parse(rawImages) : []
  } catch {
    return { success: false, errors: { images: 'Ugyldig bildedata.' } }
  }

  let parsedVariants: unknown[]
  try {
    parsedVariants = rawVariants ? JSON.parse(rawVariants) : []
  } catch {
    return { success: false, errors: { variants: 'Ugyldig variantdata.' } }
  }

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    salePrice: salePriceNOK ? Math.round(salePriceNOK * 100) : null,
    category: formData.get('category'),
    images: parsedImages,
    stockCount: Number(formData.get('stockCount')),
    shippingCost: Math.round(Number(formData.get('shippingCost') || '0') * 100),
    publish: formData.get('publish') === 'true',
    variants: parsedVariants,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  // Check slug uniqueness
  const existingSlug = await adminDb
    .collection('products')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlug.empty) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
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

  try {
    const docRef = await adminDb.collection('products').add({
      ...data,
      variants: mappedVariants,
      inStock: data.stockCount > 0,
      publishedAt: publish ? now : null,
      createdAt: now,
      updatedAt: now,
    })

    revalidateTag('products', 'max')
    return { success: true, data: { id: docRef.id } }
  } catch (err) {
    console.error('[createProduct] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke opprette produktet. Prøv igjen.' } }
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawImages = formData.get('images') as string
  const priceNOK = Number(formData.get('price'))
  const salePriceNOK = formData.get('salePrice') ? Number(formData.get('salePrice')) : null
  const rawVariants = formData.get('variants') as string

  let parsedImages: unknown[]
  try {
    parsedImages = rawImages ? JSON.parse(rawImages) : []
  } catch {
    return { success: false, errors: { images: 'Ugyldig bildedata.' } }
  }

  let parsedVariants: unknown[]
  try {
    parsedVariants = rawVariants ? JSON.parse(rawVariants) : []
  } catch {
    return { success: false, errors: { variants: 'Ugyldig variantdata.' } }
  }

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: Math.round(priceNOK * 100),
    salePrice: salePriceNOK ? Math.round(salePriceNOK * 100) : null,
    category: formData.get('category'),
    images: parsedImages,
    stockCount: Number(formData.get('stockCount')),
    shippingCost: Math.round(Number(formData.get('shippingCost') || '0') * 100),
    publish: formData.get('publish') === 'true',
    variants: parsedVariants,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  // Check slug uniqueness (exclude current document)
  const existingSlugUpdate = await adminDb
    .collection('products')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlugUpdate.empty && existingSlugUpdate.docs[0].id !== id) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
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
  if (!existingDoc.exists) {
    return { success: false, errors: { _form: 'Produktet ble ikke funnet.' } }
  }
  const existing = existingDoc.data()
  const now = new Date()

  try {
    await adminDb.collection('products').doc(id).update({
      ...data,
      variants: mappedVariants,
      inStock: data.stockCount > 0,
      publishedAt: publish
        ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
        : (existing.publishedAt instanceof Date ? existing.publishedAt : null),
      updatedAt: now,
    })

    revalidateTag('products', 'max')
    return { success: true }
  } catch (err) {
    console.error('[updateProduct] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke oppdatere produktet. Prøv igjen.' } }
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  await adminDb.collection('products').doc(id).delete()
  revalidateTag('products', 'max')
  return { success: true }
}
