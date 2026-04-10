'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { PublishBar } from '@/components/admin/PublishBar'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { generateSlug } from '@/lib/validations'
import { createProduct } from '@/actions/products'
import { toast } from 'sonner'
import type { ProductImage, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'drikke', label: 'Drikke' },
  { value: 'kaffe-te', label: 'Kaffe & Te' },
  { value: 'naturprodukter', label: 'Naturprodukter' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [shippingCost, setShippingCost] = useState('0')
  const [stockCount, setStockCount] = useState('0')
  const [category, setCategory] = useState<ProductCategory>('drikke')
  const [images, setImages] = useState<ProductImage[]>([])
  const [variants, setVariants] = useState<Array<{
    id: string
    label: string
    price: string
    stockCount: string
  }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }

  const submitForm = async (publish: boolean) => {
    const loading = publish ? setIsPublishing : setIsSaving
    loading(true)
    setErrors({})

    const formData = new FormData()
    formData.set('name', name)
    formData.set('slug', slug)
    formData.set('description', description)
    formData.set('price', price)
    formData.set('stockCount', stockCount)
    formData.set('shippingCost', shippingCost)
    formData.set('category', category)
    formData.set('images', JSON.stringify(images))
    formData.set('publish', String(publish))
    formData.set('variants', JSON.stringify(
      variants.map((v) => ({
        id: v.id || `v-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        label: v.label,
        price: Number(v.price),
        stockCount: Number(v.stockCount),
      }))
    ))

    const result = await createProduct(formData)
    loading(false)

    if (result.success) {
      toast.success('Produkt opprettet.')
      router.push('/admin/produkter')
    } else if (result.errors) {
      setErrors(result.errors)
      const firstError = result.errors._form || Object.values(result.errors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      // Scroll to first visible error after React re-renders
      requestAnimationFrame(() => {
        const firstError = document.querySelector('[role="alert"]')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          if (firstError instanceof HTMLElement && firstError.tabIndex >= 0) {
            firstError.focus()
          }
        }
      })
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Produkter', href: '/admin/produkter' },
          { label: 'Ny' },
        ]}
      />
      <h1 className="mb-8 font-heading text-h2 font-bold text-forest">
        Nytt produkt
      </h1>

      {errors._form && (
        <FormError id="form-error" message={errors._form} className="mb-4" />
      )}

      <div className="space-y-6">
        {/* Grunnleggende info */}
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Grunnleggende info
          </h2>
          <div className="space-y-4">
            <Input
              label="Navn"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={errors.slug}
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-label font-normal tracking-wide text-forest"
              >
                Beskrivelse
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-body text-forest placeholder:text-body/60 focus:border-forest"
              />
              {errors.description && (
                <FormError
                  id="description-error"
                  message={errors.description}
                />
              )}
            </div>
          </div>
        </section>

        <hr className="border-forest/12" />

        {/* Bilder */}
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Bilder
          </h2>
          <ImageUpload images={images} onChange={setImages} />
          {(errors.images || Object.keys(errors).some(k => k.startsWith('images.'))) && (
            <FormError
              id="images-error"
              message={errors.images || Object.entries(errors).filter(([k]) => k.startsWith('images.')).map(([, v]) => v).join('. ')}
              className="mt-2"
            />
          )}
        </section>

        <hr className="border-forest/12" />

        {/* Pris og lager */}
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Pris og lager
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Pris (NOK)"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
            />
            <Input
              label="Frakt (NOK)"
              type="number"
              min={0}
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              error={errors.shippingCost}
              placeholder="0 = gratis"
            />
            <Input
              label="Lagertall"
              type="number"
              min={0}
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              error={errors.stockCount}
            />
          </div>
        </section>

        <hr className="border-forest/12" />

        {/* Kategori */}
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Kategori
          </h2>
          <fieldset>
            <legend className="sr-only">Velg kategori</legend>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className="flex min-h-[44px] items-center gap-3 text-body text-forest"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="h-4 w-4 accent-forest"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <hr className="border-forest/12" />

        {/* Varianter */}
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Varianter <span className="text-label font-normal text-body/60">(valgfritt)</span>
          </h2>
          <p className="mb-4 text-label text-body/70">
            Legg til varianter hvis produktet finnes i ulike størrelser, volum eller typer.
          </p>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id || i} className="flex flex-wrap items-end gap-3 rounded-lg border border-forest/10 bg-card p-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="mb-1 block text-label font-medium text-forest" htmlFor={`v-label-${i}`}>
                    Navn
                  </label>
                  <input
                    id={`v-label-${i}`}
                    type="text"
                    value={v.label}
                    onChange={(e) => {
                      const updated = [...variants]
                      updated[i] = { ...updated[i], label: e.target.value }
                      setVariants(updated)
                    }}
                    placeholder="F.eks. 250 ml"
                    className="w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-label font-medium text-forest" htmlFor={`v-price-${i}`}>
                    Pris (NOK)
                  </label>
                  <input
                    id={`v-price-${i}`}
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => {
                      const updated = [...variants]
                      updated[i] = { ...updated[i], price: e.target.value }
                      setVariants(updated)
                    }}
                    className="w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-label font-medium text-forest" htmlFor={`v-stock-${i}`}>
                    Lager
                  </label>
                  <input
                    id={`v-stock-${i}`}
                    type="number"
                    min={0}
                    value={v.stockCount}
                    onChange={(e) => {
                      const updated = [...variants]
                      updated[i] = { ...updated[i], stockCount: e.target.value }
                      setVariants(updated)
                    }}
                    className="w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded-md px-3 py-2 text-label text-body/60 hover:text-destructive"
                  aria-label={`Fjern variant ${v.label || i + 1}`}
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVariants([...variants, { id: '', label: '', price: '', stockCount: '0' }])}
            className="mt-3 inline-flex items-center gap-1 rounded-lg border border-dashed border-forest/20 px-3 py-2 text-sm text-forest hover:bg-card"
          >
            <span aria-hidden="true">+</span>
            Legg til variant
          </button>
        </section>
      </div>

      <PublishBar
        onSaveDraft={() => submitForm(false)}
        onPublish={() => submitForm(true)}
        isPublished={false}
        isSaving={isSaving}
        isPublishing={isPublishing}
        contentType="product"
      />
    </div>
  )
}
