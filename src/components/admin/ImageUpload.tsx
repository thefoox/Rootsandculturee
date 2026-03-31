'use client'

import { useState, useRef, useCallback } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { uploadImage } from '@/lib/firebase/storage'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import type { ProductImage } from '@/types'

interface ImageUploadProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (images.length + fileArray.length > maxImages) {
        toast.error(`Maks ${maxImages} bilder.`)
        return
      }

      setUploading(true)
      for (const file of fileArray) {
        try {
          const path = `images/${Date.now()}-${file.name}`
          const url = await uploadImage(file, path, (p) => {
            setProgress(p.percent)
          })
          const newImage: ProductImage = { url, alt: '' }
          onChange([...images, newImage])
          images = [...images, newImage]
          toast.success('Bilde lastet opp.')
        } catch (err) {
          toast.error(
            err instanceof Error
              ? err.message
              : 'Kunne ikke laste opp bildet.'
          )
        }
      }
      setUploading(false)
      setProgress(0)
    },
    [images, onChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleAltChange = (index: number, alt: string) => {
    const updated = images.map((img, i) =>
      i === index ? { ...img, alt } : img
    )
    onChange(updated)
  }

  return (
    <div role="region" aria-label="Bildeopplasting">
      {/* Drop zone */}
      <div
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
          dragOver
            ? 'border-forest bg-forest/5'
            : 'border-forest/30 hover:border-forest/50 hover:bg-forest/5'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="h-8 w-8 text-forest" aria-hidden="true" />
        <p className="mt-2 text-[15px] text-body">
          Slipp bilder her eller klikk for a velge
        </p>
        <p className="mt-1 text-[13px] text-body/60">
          Maks 5 MB per bilde. JPG, PNG, WebP.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
          aria-label="Velg bilder"
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="mt-2">
          <div
            className="h-[2px] overflow-hidden rounded bg-card"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Laster opp bilder"
          >
            <div
              className="h-full bg-forest transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded images */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((img, index) => (
            <div key={index} className="space-y-2">
              <div className="group relative">
                <img
                  src={img.url}
                  alt={img.alt || 'Opplastet bilde'}
                  className="h-[120px] w-[120px] rounded object-cover"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute right-1 top-1 hidden h-7 w-7 items-center justify-center rounded-full bg-forest/60 text-cream group-hover:flex"
                  aria-label={`Fjern bilde ${index + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <Input
                label="Alt-tekst (obligatorisk)"
                placeholder="Beskriv bildet for skjermlesere"
                value={img.alt}
                onChange={(e) => handleAltChange(index, e.target.value)}
                aria-required="true"
                error={
                  img.alt === ''
                    ? undefined
                    : undefined
                }
                id={`alt-tekst-${index}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
