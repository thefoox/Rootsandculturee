import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '@/lib/data/products'
import { formatPrice } from '@/lib/format'
import type { PageSection } from '@/types'

export async function ProductsGridSection({ section }: { section: PageSection }) {
  const products = await getProducts()

  return (
    <section className="bg-card py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            {section.heading && (
              <h2 className="font-heading text-h1 font-bold text-forest">
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="mt-2 max-w-md font-body text-body">
                {section.subheading}
              </p>
            )}
          </div>
          <Link
            href="/produkter"
            className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
          >
            Se alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {products.slice(0, 4).map((product) => {
            const mainImage = product.images[0]
            return (
              <Link
                key={product.id}
                href={`/produkter/${product.slug}`}
                className="group overflow-hidden rounded-xl bg-cream shadow-sm motion-safe:transition-all motion-safe:duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt}
                      fill
                      className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-cream text-body/50">
                      Bilde kommer
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-label uppercase tracking-wider text-body/60">
                    {product.category === 'drikke' ? 'Drikke' : product.category === 'kaffe-te' ? 'Kaffe & Te' : 'Naturprodukter'}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-bold leading-tight text-forest">
                    {product.name}
                  </h3>
                  <p className="mt-2 font-body text-body font-bold text-forest">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/produkter"
            className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
          >
            Se alle produkter <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
