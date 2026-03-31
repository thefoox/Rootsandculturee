import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/lib/data/products'
import { ProductGallery } from '@/components/products/ProductGallery'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/ui/Button'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Produkt ikke funnet — Roots & Culture' }
  }

  return {
    title: `${product.name} — Roots & Culture`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProduktDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-12 md:px-8">
      <Breadcrumbs items={[{ label: 'Produkter', href: '/produkter' }, { label: product.name }]} />
      <article className="mt-4 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="lg:w-[60%]">
          <ProductGallery images={product.images} />
        </div>
        <div className="lg:w-[40%]">
          <h1 className="font-heading text-[28px] font-bold text-forest">
            {product.name}
          </h1>
          <PriceBadge priceInOre={product.price} className="mt-4 block text-[20px]" />
          <p className="mt-6 font-body text-[15px] leading-[1.5] text-forest">
            {product.description}
          </p>
          <div className="mt-8">
            <Button
              variant="primary"
              disabled
              aria-disabled="true"
              title="Handlekurv kommer snart"
              className="w-full lg:w-auto"
            >
              Legg i handlekurv
            </Button>
          </div>
        </div>
      </article>
    </div>
  )
}
