import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/format'
import { PriceBadge } from '@/components/shared/PriceBadge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]

  return (
    <Link
      href={`/produkter/${product.slug}`}
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
      className="group block overflow-hidden rounded-xl border border-forest/8 bg-card shadow-sm motion-safe:transition-all motion-safe:duration-150 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            width={400}
            height={300}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-bark">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-heading text-[20px] font-bold leading-[1.25] text-forest">
          {product.name}
        </h3>
        <PriceBadge priceInOre={product.price} className="mt-2 block" />
      </div>
    </Link>
  )
}
