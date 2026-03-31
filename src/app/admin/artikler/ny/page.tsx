'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { PublishBar } from '@/components/admin/PublishBar'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { generateSlug } from '@/lib/validations'
import { createArticle } from '@/actions/articles'
import { toast } from 'sonner'
import type { ProductImage } from '@/types'

export default function NewArticlePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState<ProductImage[]>([])
  const [body, setBody] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setSlug(generateSlug(value))
  }

  const submitForm = async (publish: boolean) => {
    const loading = publish ? setIsPublishing : setIsSaving
    loading(true)
    setErrors({})

    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('body', body)
    formData.set(
      'coverImage',
      JSON.stringify(
        coverImage[0] || { url: '', alt: '' }
      )
    )
    formData.set('metaTitle', metaTitle)
    formData.set('metaDescription', metaDescription)
    formData.set('publish', String(publish))

    const result = await createArticle(formData)
    loading(false)

    if (result.success) {
      toast.success('Artikkel opprettet.')
      router.push('/admin/artikler')
    } else if (result.errors) {
      setErrors(result.errors)
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artikler', href: '/admin/artikler' },
          { label: 'Ny' },
        ]}
      />
      <h1 className="mb-8 font-heading text-h2 font-bold text-forest">
        Ny artikkel
      </h1>

      {errors._form && (
        <FormError id="form-error" message={errors._form} className="mb-4" />
      )}

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Grunnleggende info
          </h2>
          <div className="space-y-4">
            <Input
              label="Tittel"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={errors.title}
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={errors.slug}
            />
          </div>
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Fremhevet bilde
          </h2>
          <ImageUpload
            images={coverImage}
            onChange={setCoverImage}
            maxImages={1}
          />
          {errors['coverImage.url'] && (
            <FormError
              id="cover-image-error"
              message={errors['coverImage.url']}
              className="mt-2"
            />
          )}
          {errors['coverImage.alt'] && (
            <FormError
              id="cover-image-alt-error"
              message={errors['coverImage.alt']}
              className="mt-2"
            />
          )}
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Innhold
          </h2>
          <TiptapEditor content={body} onChange={setBody} />
          {errors.body && (
            <FormError
              id="body-error"
              message={errors.body}
              className="mt-2"
            />
          )}
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            SEO
          </h2>
          <div className="space-y-4">
            <div>
              <Input
                label="Meta tittel"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={70}
              />
              <p className="mt-1 text-label text-body">
                {metaTitle.length} / 70 tegn
              </p>
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="metaDescription"
                  className="text-label font-normal tracking-wide text-forest"
                >
                  Meta beskrivelse
                </label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-body text-forest placeholder:text-body/60 focus:border-forest"
                />
              </div>
              <p className="mt-1 text-label text-body">
                {metaDescription.length} / 160 tegn
              </p>
            </div>
          </div>
        </section>
      </div>

      <PublishBar
        onSaveDraft={() => submitForm(false)}
        onPublish={() => submitForm(true)}
        isPublished={false}
        isSaving={isSaving}
        isPublishing={isPublishing}
        contentType="article"
      />
    </div>
  )
}
