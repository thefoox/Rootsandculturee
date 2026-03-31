'use client'

import { useState, useRef, useCallback } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductImage } from '@/types'

interface CmsImageUploadProps {
  image: ProductImage | null | undefined
  onChange: (image: ProductImage) => void
  label?: string
}

export function CmsImageUpload({ image, onChange, label = 'Bilde' }: CmsImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bildet er for stort. Maks 5 MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.url) {
        onChange({ url: data.url, alt: image?.alt || '' })
        toast.success('Bilde lastet opp!')
      } else {
        toast.error('Opplasting feilet.')
      }
    } catch {
      toast.error('Kunne ikke laste opp bildet.')
    }
    setUploading(false)
  }, [onChange, image?.alt])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div>
      <label className="mb-1 block text-[13px] font-medium text-forest">{label}</label>

      {/* Preview */}
      {image?.url && (
        <div className="relative mb-3 overflow-hidden rounded-lg border border-forest/10">
          <img src={image.url} alt={image.alt || ''} className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange({ url: '', alt: '' })}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-forest/70 text-cream hover:bg-forest"
            aria-label="Fjern bilde"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed motion-safe:transition-colors ${
          dragOver ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40 hover:bg-forest/3'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <p className="text-[14px] text-body">Laster opp...</p>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-forest/50" aria-hidden="true" />
            <p className="mt-1.5 text-[13px] text-body/60">
              Slipp bilde her eller klikk for å velge
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
          aria-label="Velg bilde"
        />
      </div>

      {/* Alt text */}
      {image?.url && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Alt-tekst (beskriv bildet)"
            value={image.alt || ''}
            onChange={(e) => onChange({ url: image.url, alt: e.target.value })}
            className="w-full rounded-md border border-forest/15 bg-card px-3 py-2 text-[14px] text-forest placeholder:text-body/40"
          />
        </div>
      )}
    </div>
  )
}
