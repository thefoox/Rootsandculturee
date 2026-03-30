'use client'

import { useState, useEffect } from 'react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ContentBlockEditor } from '@/components/admin/ContentBlockEditor'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { fetchSiteContent, updateSiteContent } from '@/actions/site-content'
import { toast } from 'sonner'

export default function SiteContentPage() {
  const [heroTitle, setHeroTitle] = useState('')
  const [heroIngress, setHeroIngress] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteContent().then((content) => {
      if (content) {
        setHeroTitle(content.heroTitle)
        setHeroIngress(content.heroIngress)
        setAboutText(content.aboutText)
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setErrors({})

    const formData = new FormData()
    formData.set('heroTitle', heroTitle)
    formData.set('heroIngress', heroIngress)
    formData.set('aboutText', aboutText)

    const result = await updateSiteContent(formData)
    setIsSaving(false)

    if (result.success) {
      toast.success('Innhold oppdatert.')
    } else if (result.errors) {
      setErrors(result.errors)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-bark">
        Laster...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Sideinnhold' },
        ]}
      />
      <h1 className="mb-8 font-heading text-[28px] font-bold text-forest">
        Sideinnhold
      </h1>

      {errors._form && (
        <FormError id="form-error" message={errors._form} className="mb-4" />
      )}

      <div className="space-y-6">
        <ContentBlockEditor
          label="Hero-tittel"
          value={heroTitle}
          onChange={setHeroTitle}
          id="heroTitle"
        />
        {errors.heroTitle && (
          <FormError id="heroTitle-error" message={errors.heroTitle} />
        )}

        <ContentBlockEditor
          label="Hero-ingress"
          value={heroIngress}
          onChange={setHeroIngress}
          multiline
          id="heroIngress"
        />
        {errors.heroIngress && (
          <FormError id="heroIngress-error" message={errors.heroIngress} />
        )}

        <ContentBlockEditor
          label="Om oss-tekst"
          value={aboutText}
          onChange={setAboutText}
          multiline
          id="aboutText"
        />
        {errors.aboutText && (
          <FormError id="aboutText-error" message={errors.aboutText} />
        )}

        <div className="pt-4">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
          >
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
