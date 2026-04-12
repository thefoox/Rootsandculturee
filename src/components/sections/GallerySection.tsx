'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageSection } from '@/types'

export function GallerySection({ section }: { section: PageSection }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const images = (section.items || []).filter((item) => item.image)

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
  }, [images.length])
  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))
  }, [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        {section.heading && (
          <h2 className="mb-10 text-center font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {images.map((item, i) => (
              <button
                key={i}
                type="button"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Åpne bilde ${i + 1}: ${item.image!.alt}`}
              >
                <Image
                  src={item.image!.url}
                  alt={item.image!.alt}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex]?.image && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Bildegallerivisning"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Forrige bilde"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].image!.url}
              alt={images[lightboxIndex].image!.alt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              sizes="90vw"
              priority
            />
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-label text-white/80">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Neste bilde"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </section>
  )
}
