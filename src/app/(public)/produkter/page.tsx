import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Package } from 'lucide-react'
import { getProducts, getProductsByCategory } from '@/lib/data/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { CategoryTabs } from '@/components/products/CategoryTabs'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ProductCategory } from '@/types'

export const metadata: Metadata = {
  title: 'Produkter — Roots & Culture',
  description:
    'Utforsk vart utvalg av autentiske norske produkter — drikke, kaffe, te og naturprodukter.',
  openGraph: {
    title: 'Produkter',
    description:
      'Utforsk vart utvalg av autentiske norske produkter — drikke, kaffe, te og naturprodukter.',
  },
}

export const revalidate = 3600

const categories = [
  { value: 'drikke', label: 'Drikke' },
  { value: 'kaffe-te', label: 'Kaffe & Te' },
  { value: 'naturprodukter', label: 'Naturprodukter' },
]

const validCategories: ProductCategory[] = ['drikke', 'kaffe-te', 'naturprodukter']

interface PageProps {
  searchParams: Promise<{ kategori?: string }>
}

export default async function ProdukterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const kategori = params.kategori || ''
  const isValidCategory = validCategories.includes(kategori as ProductCategory)

  const products = isValidCategory
    ? await getProductsByCategory(kategori as ProductCategory)
    : await getProducts()

  return (
    <>
      <Suspense fallback={null}>
        <CategoryTabs
          categories={categories}
          activeCategory={isValidCategory ? kategori : ''}
        />
      </Suspense>
      <div className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8 md:pb-24">
        <div className="pb-8 pt-12">
          <h1 className="font-heading text-[28px] font-bold text-forest">
            Produkter
          </h1>
          <p className="mt-2 text-[15px] text-bark">
            Utforsk vart handplukkede utvalg av autentiske norske produkter.
          </p>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon={Package}
            heading="Ingen produkter"
            body="Vi har ingen produkter i denne kategorien enna."
          />
        )}
      </div>
    </>
  )
}
