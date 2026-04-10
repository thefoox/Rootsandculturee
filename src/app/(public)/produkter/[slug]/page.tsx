import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/lib/data/products'
import { ProductGallery } from '@/components/products/ProductGallery'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { VariantSelector } from '@/components/products/VariantSelector'
import { productJsonLd } from '@/lib/json-ld'

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
  try {
    const products = await getProducts()
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function ProduktDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-24 md:px-8">
      <Breadcrumbs items={[{ label: 'Produkter', href: '/produkter' }, { label: product.name }]} />
      <article className="mt-4 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="lg:w-[60%]">
          <ProductGallery images={product.images} />
        </div>
        <div className="lg:w-[40%]">
          <h1 className="font-heading text-h2 font-bold text-forest">
            {product.name}
          </h1>
          {product.variants.length === 0 && (
            <PriceBadge priceInOre={product.price} className="mt-4 block text-h4" />
          )}
          <p className="mt-2 text-label text-forest/70">
            {product.shippingCost > 0
              ? `Frakt: ${(product.shippingCost / 100).toLocaleString('nb-NO')} kr`
              : 'Gratis frakt'}
          </p>
          <p className="mt-6 font-body text-body leading-[1.5] text-forest whitespace-pre-line">
            {product.description}
          </p>
          <div className="mt-8">
            {!product.inStock ? (
              <div>
                <button
                  disabled
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest/30 px-6 font-body text-body font-semibold text-cream cursor-not-allowed"
                >
                  Utsolgt
                </button>
                <p className="mt-3 text-label text-forest/60">
                  Dette produktet er midlertidig utsolgt.
                </p>
              </div>
            ) : product.variants.length > 0 ? (
              <VariantSelector product={{ id: product.id, slug: product.slug, name: product.name, price: product.price, images: product.images, variants: product.variants }} />
            ) : (
              <AddToCartButton product={{ id: product.id, slug: product.slug, name: product.name, price: product.price, images: product.images }} />
            )}
          </div>
        </div>
      </article>
    </div>
    </>
  )
}
