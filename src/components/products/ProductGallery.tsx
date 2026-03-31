'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-card text-body">
        Ingen bilder tilgjengelig
      </div>
    )
  }

  const activeImage = images[activeIndex]

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Bilde ${index + 1} av ${images.length}: ${image.alt}`}
              aria-pressed={index === activeIndex}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 ${
                index === activeIndex
                  ? 'border-forest'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
