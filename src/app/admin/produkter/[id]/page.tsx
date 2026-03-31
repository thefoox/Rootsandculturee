'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { PublishBar } from '@/components/admin/PublishBar'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { generateSlug } from '@/lib/validations'
import { getProductById, updateProduct } from '@/actions/products'
import { toast } from 'sonner'
import type { ProductImage, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'drikke', label: 'Drikke' },
  { value: 'kaffe-te', label: 'Kaffe & Te' },
  { value: 'naturprodukter', label: 'Naturprodukter' },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stockCount, setStockCount] = useState('0')
  const [category, setCategory] = useState<ProductCategory>('drikke')
  const [images, setImages] = useState<ProductImage[]>([])
  const [isPublished, setIsPublished] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductById(id).then((product) => {
      if (!product) {
        router.push('/admin/produkter')
        return
      }
      setName(product.name)
      setSlug(product.slug)
      setDescription(product.description)
      setPrice(String(product.price / 100))
      setStockCount(String(product.stockCount))
      setCategory(product.category)
      setImages(product.images)
      setIsPublished(product.publishedAt !== null)
      setLoading(false)
    })
  }, [id, router])

  const submitForm = async (publish: boolean) => {
    const setLoadingState = publish ? setIsPublishing : setIsSaving
    setLoadingState(true)
    setErrors({})

    const formData = new FormData()
    formData.set('name', name)
    formData.set('slug', slug)
    formData.set('description', description)
    formData.set('price', price)
    formData.set('stockCount', stockCount)
    formData.set('category', category)
    formData.set('images', JSON.stringify(images))
    formData.set('publish', String(publish))

    const result = await updateProduct(id, formData)
    setLoadingState(false)

    if (result.success) {
      toast.success('Produkt oppdatert.')
      router.push('/admin/produkter')
    } else if (result.errors) {
      setErrors(result.errors)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-body">
        Laster...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Produkter', href: '/admin/produkter' },
          { label: `Rediger: ${name}` },
        ]}
      />
      <h1 className="mb-8 font-heading text-[28px] font-bold text-forest">
        Rediger produkt
      </h1>

      {errors._form && (
        <FormError id="form-error" message={errors._form} className="mb-4" />
      )}

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Grunnleggende info
          </h2>
          <div className="space-y-4">
            <Input
              label="Navn"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSlug(generateSlug(e.target.value))
              }}
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
                className="text-[13px] font-normal tracking-wide text-forest"
              >
                Beskrivelse
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-body/60 focus:border-forest"
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

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Bilder
          </h2>
          <ImageUpload images={images} onChange={setImages} />
          {errors.images && (
            <FormError
              id="images-error"
              message={errors.images}
              className="mt-2"
            />
          )}
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Pris og lager
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pris (NOK)"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
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

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Kategori
          </h2>
          <fieldset>
            <legend className="sr-only">Velg kategori</legend>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className="flex min-h-[44px] items-center gap-3 text-[15px] text-forest"
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
      </div>

      <PublishBar
        onSaveDraft={() => submitForm(false)}
        onPublish={() => submitForm(true)}
        isPublished={isPublished}
        isSaving={isSaving}
        isPublishing={isPublishing}
        contentType="product"
      />
    </div>
  )
}
