'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CmsImageUpload } from '@/components/admin/CmsImageUpload'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { toast } from 'sonner'
import type { PageSection, PageContent, SectionItem, SectionType } from '@/types'

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'Hero-seksjon',
  'text-image': 'Tekst + bilde',
  text: 'Tekstseksjon',
  values: 'Verdier',
  team: 'Team',
  faq: 'FAQ',
  cta: 'Call to Action',
  gallery: 'Bildegalleri',
  'contact-info': 'Kontaktinformasjon',
  'experiences-grid': 'Opplevelser (auto)',
  'articles-grid': 'Artikler (auto)',
  'products-grid': 'Produkter (auto)',
  'trust-bar': 'Tillitsbar',
  location: 'Lokasjon',
  testimonials: 'Omtaler',
  newsletter: 'Nyhetsbrev',
  categories: 'Opplevelseskategorier (auto)',
  video: 'Video',
  stats: 'Tall i fokus',
  'logo-bar': 'Partnere / Omtalt i',
}

const ALL_SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[]

function createDefaultSection(type: SectionType, order: number): PageSection {
  const base: PageSection = {
    id: `section-${crypto.randomUUID()}`,
    type,
    heading: '',
    order,
  }
  if (['hero', 'cta', 'text-image'].includes(type)) {
    base.ctaText = ''
    base.ctaLink = ''
  }
  if (['text', 'text-image'].includes(type)) {
    base.body = ''
  }
  if (['text', 'text-image', 'video'].includes(type)) {
    base.body = ''
  }
  if (['hero', 'text', 'cta', 'experiences-grid', 'articles-grid', 'products-grid', 'testimonials', 'newsletter', 'stats'].includes(type)) {
    base.subheading = ''
  }
  if (['faq', 'values', 'team', 'gallery', 'contact-info', 'trust-bar', 'testimonials', 'categories', 'stats', 'logo-bar'].includes(type)) {
    base.items = []
  }
  if (['newsletter'].includes(type)) {
    base.ctaText = ''
    base.ctaLink = ''
  }
  return base
}

function SortableSection({
  section,
  isOpen,
  onToggle,
  onUpdate,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onDelete,
}: {
  section: PageSection
  isOpen: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<PageSection>) => void
  onUpdateItem: (index: number, updates: Partial<SectionItem>) => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasSubheading = ['hero', 'text', 'cta', 'experiences-grid', 'articles-grid', 'products-grid', 'testimonials', 'newsletter', 'stats'].includes(section.type)
  const hasBody = ['text-image', 'text', 'video'].includes(section.type)
  const hasImage = ['hero', 'text-image', 'cta', 'contact-info'].includes(section.type)
  const hasCta = ['hero', 'cta', 'text-image', 'newsletter'].includes(section.type)
  const hasItems = ['faq', 'values', 'team', 'gallery', 'contact-info', 'trust-bar', 'testimonials', 'categories', 'stats', 'logo-bar'].includes(section.type)
  const hasImagePosition = section.type === 'text-image'
  const isDataSection = ['experiences-grid', 'articles-grid', 'products-grid'].includes(section.type)

  return (
    <div ref={setNodeRef} style={style} className="overflow-hidden rounded-xl border border-forest/10 bg-cream">
      <div className="flex items-center gap-1 px-2 py-3">
        <button
          type="button"
          className="cursor-grab touch-none p-1 text-body/40 hover:text-body/70"
          aria-label="Dra for å sortere"
          {...attributes}
          {...listeners}
        >
          <span className="text-base" aria-hidden="true">⋮⋮</span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 px-2 text-left"
        >
          <div className="flex-1">
            <span className="text-label uppercase tracking-wider text-body/50">
              {SECTION_TYPE_LABELS[section.type] || section.type}
            </span>
            <p className="font-medium text-forest text-body">
              {section.heading || section.id}
            </p>
          </div>
          <span className="text-body/50" aria-hidden="true">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-body/40 hover:text-red-600"
          aria-label="Slett seksjon"
        >
          Slett
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-forest/8 px-5 py-5 space-y-5">
          {isDataSection && (
            <p className="rounded-lg bg-card p-3 text-sm text-body/70">
              Denne seksjonen henter innhold automatisk. Du kan redigere overskrift og undertekst.
            </p>
          )}

          <Input
            label="Overskrift"
            value={section.heading || ''}
            onChange={(e) => onUpdate({ heading: e.target.value })}
          />

          {hasSubheading && (
            <div>
              <label className="mb-1 block text-label font-medium text-forest">Undertekst</label>
              <textarea
                className="w-full rounded-md border border-forest/15 bg-card px-3 py-2 text-body text-forest min-h-[80px]"
                value={section.subheading || ''}
                onChange={(e) => onUpdate({ subheading: e.target.value })}
              />
            </div>
          )}

          {hasBody && section.type === 'video' ? (
            <Input
              label="Video-URL (YouTube eller Vimeo)"
              value={section.body || ''}
              onChange={(e) => onUpdate({ body: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          ) : hasBody ? (
            <div>
              <label className="mb-1 block text-label font-medium text-forest">Brødtekst</label>
              <TiptapEditor
                content={section.body || ''}
                onChange={(html) => onUpdate({ body: html })}
              />
            </div>
          ) : null}

          {hasImage && (
            <CmsImageUpload
              image={section.image}
              onChange={(img) => onUpdate({ image: img ?? undefined })}
            />
          )}

          {hasCta && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Knappetekst"
                value={section.ctaText || ''}
                onChange={(e) => onUpdate({ ctaText: e.target.value })}
              />
              <Input
                label="Lenke"
                value={section.ctaLink || ''}
                onChange={(e) => onUpdate({ ctaLink: e.target.value })}
              />
            </div>
          )}

          {hasImagePosition && (
            <div>
              <label className="mb-2 block text-label font-medium text-forest">
                Bildeposisjon
              </label>
              <div className="flex gap-3">
                {(['left', 'right'] as const).map((pos) => (
                  <label key={pos} className="flex items-center gap-2 text-body text-forest">
                    <input
                      type="radio"
                      name={`imagePosition-${section.id}`}
                      value={pos}
                      checked={(section.imagePosition || 'left') === pos}
                      onChange={() => onUpdate({ imagePosition: pos })}
                      className="h-4 w-4 accent-forest"
                    />
                    {pos === 'left' ? 'Bilde til venstre' : 'Bilde til høyre'}
                  </label>
                ))}
              </div>
            </div>
          )}

          {hasItems && (
            <div>
              <label className="mb-2 block text-label font-medium text-forest">
                Elementer ({(section.items || []).length})
              </label>
              <div className="space-y-3">
                {(section.items || []).map((item, i) => (
                  <div key={i} className="rounded-lg border border-forest/8 bg-card/50 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-label text-body/50">Element {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(i)}
                        className="p-1 text-body/40 hover:text-red-600"
                        aria-label="Fjern element"
                      >
                        Slett
                      </button>
                    </div>
                    {section.type !== 'gallery' && section.type !== 'logo-bar' && (
                      <Input
                        label={section.type === 'faq' ? 'Spørsmål' : section.type === 'testimonials' ? 'Forfatter' : section.type === 'stats' ? 'Tall (f.eks. 500+)' : 'Tittel'}
                        value={item.title}
                        onChange={(e) => onUpdateItem(i, { title: e.target.value })}
                      />
                    )}
                    {section.type !== 'gallery' && section.type !== 'logo-bar' && (
                      <div>
                        <label className="mb-1 block text-label font-medium text-forest">
                          {section.type === 'faq' ? 'Svar' : section.type === 'testimonials' ? 'Sitat' : section.type === 'stats' ? 'Beskrivelse (f.eks. Fornøyde gjester)' : 'Beskrivelse'}
                        </label>
                        <textarea
                          className="w-full rounded-md border border-forest/15 bg-cream px-3 py-2 text-body text-forest min-h-[60px]"
                          value={item.description}
                          onChange={(e) => onUpdateItem(i, { description: e.target.value })}
                        />
                      </div>
                    )}
                    {(section.type === 'team' || section.type === 'gallery' || section.type === 'categories' || section.type === 'logo-bar') && (
                      <CmsImageUpload
                        image={item.image}
                        onChange={(img) => onUpdateItem(i, { image: img ?? undefined })}
                        label="Bilde"
                      />
                    )}
                    {section.type === 'values' && (
                      <Input
                        label="Ikon (lucide-navn)"
                        value={item.icon || ''}
                        onChange={(e) => onUpdateItem(i, { icon: e.target.value })}
                      />
                    )}
                    {section.type === 'contact-info' && (
                      <>
                        <Input
                          label="Ikon (lucide-navn)"
                          value={item.icon || ''}
                          onChange={(e) => onUpdateItem(i, { icon: e.target.value })}
                        />
                        <Input
                          label="Lenke (mailto:, tel:, eller URL)"
                          value={item.href || ''}
                          onChange={(e) => onUpdateItem(i, { href: e.target.value })}
                        />
                      </>
                    )}
                    {section.type === 'trust-bar' && (
                      <Input
                        label="Ikon (lucide-navn, f.eks. Leaf)"
                        value={item.icon || ''}
                        onChange={(e) => onUpdateItem(i, { icon: e.target.value })}
                      />
                    )}
                    {section.type === 'testimonials' && (
                      <Input
                        label="Rolle (f.eks. Kunde siden 2024)"
                        value={item.icon || ''}
                        onChange={(e) => onUpdateItem(i, { icon: e.target.value })}
                      />
                    )}
                    {section.type === 'categories' && (
                      <Input
                        label="Lenke (f.eks. /opplevelser/retreat)"
                        value={item.href || ''}
                        onChange={(e) => onUpdateItem(i, { href: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onAddItem}
                className="mt-3 inline-flex items-center gap-1 rounded-lg border border-dashed border-forest/20 px-3 py-2 text-sm text-forest hover:bg-card"
              >
                <span aria-hidden="true">+</span>
                Legg til element
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EditPageContentPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.pageId as string

  const [pageData, setPageData] = useState<PageContent | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [showInNav, setShowInNav] = useState(false)
  const [navOrder, setNavOrder] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetch(`/api/page-content/${pageId}`)
      .then((r) => r.json())
      .then((data: PageContent | null) => {
        if (data) {
          setPageData(data)
          setPageTitle(data.title || pageId)
          setPageSlug(data.slug || pageId)
          setIsPublished(data.isPublished ?? true)
          setShowInNav(data.showInNavigation ?? false)
          setNavOrder(data.navigationOrder ?? 0)
          setSections((data.sections || []).sort((a, b) => a.order - b.order))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pageId])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      return reordered.map((s, i) => ({ ...s, order: i }))
    })
  }

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

  function removeSectionItem(sectionId: string, itemIndex: number) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId || !s.items) return s
        return { ...s, items: s.items.filter((_, i) => i !== itemIndex) }
      })
    )
  }

  function addSection(type: SectionType) {
    const newSection = createDefaultSection(type, sections.length)
    setSections((prev) => [...prev, newSection])
    setOpenSection(newSection.id)
    setShowAddDropdown(false)
  }

  function deleteSection(sectionId: string) {
    if (deleteConfirm !== sectionId) {
      setDeleteConfirm(sectionId)
      return
    }
    setSections((prev) =>
      prev.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, order: i }))
    )
    setDeleteConfirm(null)
    if (openSection === sectionId) setOpenSection(null)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/page-content/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageTitle,
          slug: pageSlug,
          isPublished,
          showInNavigation: showInNav,
          navigationOrder: navOrder,
          sections,
        }),
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

      {/* Page settings */}
      <div className="mb-8 rounded-xl border border-forest/10 bg-cream p-5 space-y-4">
        <h2 className="font-heading text-h3 font-bold text-forest">Sideinnstillinger</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tittel"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <Input
            label="Slug (URL-path)"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-body text-forest">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-forest/30 accent-forest"
            />
            Publisert
          </label>
          <label className="flex items-center gap-2 text-body text-forest">
            <input
              type="checkbox"
              checked={showInNav}
              onChange={(e) => setShowInNav(e.target.checked)}
              className="h-4 w-4 rounded border-forest/30 accent-forest"
            />
            Vis i navigasjon
          </label>
          <div className="flex items-center gap-2">
            <label className="text-body text-forest">Sortering:</label>
            <input
              type="number"
              value={navOrder}
              onChange={(e) => setNavOrder(Number(e.target.value))}
              className="w-20 rounded-md border border-forest/20 px-2 py-1 text-body text-forest"
            />
          </div>
        </div>
      </div>

      {/* Section heading + add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-h3 font-bold text-forest">
          Seksjoner ({sections.length})
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-sm font-medium text-cream hover:bg-forest/90"
          >
            <span aria-hidden="true">+</span>
            Legg til seksjon
          </button>
          {showAddDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAddDropdown(false)}
              />
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-forest/10 bg-cream py-1 shadow-lg">
                {ALL_SECTION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addSection(type)}
                    className="block w-full px-4 py-2 text-left text-sm text-forest hover:bg-card"
                  >
                    {SECTION_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sortable sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                isOpen={openSection === section.id}
                onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
                onUpdate={(updates) => updateSection(section.id, updates)}
                onUpdateItem={(i, updates) => updateSectionItem(section.id, i, updates)}
                onAddItem={() => addSectionItem(section.id)}
                onRemoveItem={(i) => removeSectionItem(section.id, i)}
                onDelete={() => deleteSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {deleteConfirm && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Klikk slett-knappen igjen for å bekrefte sletting av seksjonen.
          <button
            type="button"
            onClick={() => setDeleteConfirm(null)}
            className="ml-2 underline"
          >
            Avbryt
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Lagre endringer
        </Button>
        <Button variant="secondary" onClick={() => router.push('/admin/innhold')}>
          Tilbake
        </Button>
        {pageSlug && (
          <a
            href={`/${pageSlug === '/' ? '' : pageSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-forest/20 px-4 py-2 text-sm font-medium text-forest hover:bg-card"
          >
            Vis side
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  )
}
