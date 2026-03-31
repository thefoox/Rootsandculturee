'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CmsImageUpload } from '@/components/admin/CmsImageUpload'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import type { PageSection, SectionItem, ProductImage } from '@/types'

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero-seksjon',
  'text-image': 'Tekst + bilde',
  text: 'Tekstseksjon',
  values: 'Verdier',
  team: 'Team',
  faq: 'FAQ',
  cta: 'Call to Action',
  gallery: 'Bildegalleri',
  'contact-info': 'Kontaktinformasjon',
}

export default function EditPageContentPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.pageId as string

  const [sections, setSections] = useState<PageSection[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/page-content/${pageId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setPageTitle(data.title || pageId)
          setSections(data.sections || [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pageId])

  function updateSection(sectionId: string, updates: Partial<PageSection>) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    )
  }

  function updateSectionItem(sectionId: string, itemIndex: number, updates: Partial<SectionItem>) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || !s.items) return s
        const newItems = [...s.items]
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates }
        return { ...s, items: newItems }
      })
    )
  }

  function addSectionItem(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s
        return { ...s, items: [...(s.items || []), { title: '', description: '' }] }
      })
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/page-content/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })
      if (res.ok) {
        toast.success('Innhold lagret!')
      } else {
        toast.error('Kunne ikke lagre.')
      }
    } catch {
      toast.error('Noe gikk galt.')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex min-h-[200px] items-center justify-center text-body">Laster...</div>
  }

  return (
    <div className="mx-auto max-w-[800px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Sideinnhold', href: '/admin/innhold' },
          { label: pageTitle },
        ]}
      />
      <h1 className="mb-2 font-heading text-h2 font-bold text-forest">{pageTitle}</h1>
      <p className="mb-8 text-body/70">{sections.length} seksjoner</p>

      <div className="space-y-3">
        {sections.sort((a, b) => a.order - b.order).map((section) => {
          const isOpen = openSection === section.id
          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-forest/10 bg-cream"
            >
              {/* Section header — accordion toggle */}
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-card/50"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-body/40" aria-hidden="true" />
                <div className="flex-1">
                  <span className="text-label uppercase tracking-wider text-body/50">
                    {SECTION_TYPE_LABELS[section.type] || section.type}
                  </span>
                  <p className="font-medium text-forest text-body">
                    {section.heading || section.id}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-body/50" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-body/50" aria-hidden="true" />
                )}
              </button>

              {/* Section body — edit fields */}
              {isOpen && (
                <div className="border-t border-forest/8 px-5 py-5 space-y-5">
                  {/* Heading */}
                  {section.type !== 'gallery' && (
                    <Input
                      label="Overskrift"
                      value={section.heading || ''}
                      onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                    />
                  )}

                  {/* Subheading */}
                  {(section.type === 'hero' || section.type === 'text' || section.type === 'cta') && (
                    <div>
                      <label className="mb-1 block text-label font-medium text-forest">Undertekst</label>
                      <textarea
                        className="w-full rounded-md border border-forest/15 bg-card px-3 py-2 text-body text-forest min-h-[80px]"
                        value={section.subheading || ''}
                        onChange={(e) => updateSection(section.id, { subheading: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Body (rich text) */}
                  {(section.type === 'text-image' || section.type === 'text') && section.body !== undefined && (
                    <div>
                      <label className="mb-1 block text-label font-medium text-forest">Brødtekst (HTML)</label>
                      <textarea
                        className="w-full rounded-md border border-forest/15 bg-card px-3 py-2 text-body text-forest min-h-[120px] font-mono text-label"
                        value={section.body || ''}
                        onChange={(e) => updateSection(section.id, { body: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Image */}
                  {(section.type === 'hero' || section.type === 'text-image' || section.type === 'cta' || section.type === 'contact-info') && (
                    <CmsImageUpload
                      image={section.image}
                      onChange={(img) => updateSection(section.id, { image: img })}
                    />
                  )}

                  {/* CTA */}
                  {(section.type === 'hero' || section.type === 'cta' || section.type === 'text-image') && section.ctaText !== undefined && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Knappetekst"
                        value={section.ctaText || ''}
                        onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                      />
                      <Input
                        label="Lenke"
                        value={section.ctaLink || ''}
                        onChange={(e) => updateSection(section.id, { ctaLink: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Items (FAQ, values, team, contact-info, gallery) */}
                  {section.items && section.items.length > 0 && (
                    <div>
                      <label className="mb-2 block text-label font-medium text-forest">
                        Elementer ({section.items.length})
                      </label>
                      <div className="space-y-3">
                        {section.items.map((item, i) => (
                          <div key={i} className="rounded-lg border border-forest/8 bg-card/50 p-4 space-y-3">
                            <Input
                              label={section.type === 'faq' ? 'Spørsmål' : 'Tittel'}
                              value={item.title}
                              onChange={(e) => updateSectionItem(section.id, i, { title: e.target.value })}
                            />
                            <div>
                              <label className="mb-1 block text-label font-medium text-forest">
                                {section.type === 'faq' ? 'Svar' : 'Beskrivelse'}
                              </label>
                              <textarea
                                className="w-full rounded-md border border-forest/15 bg-cream px-3 py-2 text-body text-forest min-h-[60px]"
                                value={item.description}
                                onChange={(e) => updateSectionItem(section.id, i, { description: e.target.value })}
                              />
                            </div>
                            {item.image && (
                              <CmsImageUpload
                                image={item.image}
                                onChange={(img) => updateSectionItem(section.id, i, { image: img })}
                                label="Bilde"
                              />
                            )}
                            {item.icon !== undefined && (
                              <Input
                                label="Ikon (lucide-navn)"
                                value={item.icon || ''}
                                onChange={(e) => updateSectionItem(section.id, i, { icon: e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {(section.type === 'faq' || section.type === 'values' || section.type === 'gallery') && (
                        <Button
                          variant="secondary"
                          className="mt-3"
                          onClick={() => addSectionItem(section.id)}
                        >
                          + Legg til element
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Lagre endringer
        </Button>
        <Button variant="secondary" onClick={() => router.push('/admin/innhold')}>
          Tilbake
        </Button>
      </div>
    </div>
  )
}
