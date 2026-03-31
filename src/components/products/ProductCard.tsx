import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductCategory } from '@/types'
import { formatPrice } from '@/lib/format'

const categoryLabels: Record<ProductCategory, string> = {
  drikke: 'Drikke',
  'kaffe-te': 'Kaffe & Te',
  naturprodukter: 'Naturprodukter',
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]
  const categoryLabel = categoryLabels[product.category] ?? product.category

  return (
    <Link
      href={`/produkter/${product.slug}`}
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
      className="group block overflow-hidden rounded-xl border border-forest/8 bg-cream shadow-sm motion-safe:transition-all motion-safe:duration-150 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Ember accent strip */}
      <div className="h-[3px] bg-forest" />

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            width={400}
            height={300}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-body">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-[11px] uppercase tracking-wider text-body/70">
          {categoryLabel}
        </span>
        <h3 className="mt-1 line-clamp-2 font-heading text-[18px] font-bold leading-[1.25] text-forest">
          {product.name}
        </h3>
        <span className="mt-1 block font-body text-[15px] font-bold text-ember">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  )
}
