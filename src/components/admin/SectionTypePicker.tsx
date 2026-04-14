'use client'

import { useEffect, useRef } from 'react'
import { X, Sparkles, Type, Image, Megaphone, Shield, Users, HelpCircle, Images, MessageSquare, BarChart3, Mail, MapPin, Newspaper, LayoutGrid, FileText, ShoppingBag, LayoutList, Video, Building2 } from 'lucide-react'
import type { SectionType } from '@/types'

interface SectionTypePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: SectionType) => void
}

const SECTION_GROUPS: {
  label: string
  types: { type: SectionType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[]
}[] = [
  {
    label: 'Hoved-seksjoner',
    types: [
      { type: 'hero', label: 'Hero-seksjon', description: 'Stor toppbanner med bilde og tekst', icon: Sparkles },
      { type: 'text', label: 'Tekstseksjon', description: 'Ren tekst med overskrift', icon: Type },
      { type: 'text-image', label: 'Tekst + bilde', description: 'Tekst og bilde side om side', icon: Image },
      { type: 'cta', label: 'Call to Action', description: 'Handlingsoppfordring med knapp', icon: Megaphone },
    ],
  },
  {
    label: 'Innhold',
    types: [
      { type: 'values', label: 'Verdier', description: 'Ikonbaserte verdikort', icon: Shield },
      { type: 'team', label: 'Team', description: 'Teammedlemmer med bilder', icon: Users },
      { type: 'faq', label: 'FAQ', description: 'Spørsmål og svar', icon: HelpCircle },
      { type: 'gallery', label: 'Bildegalleri', description: 'Rutenett med bilder', icon: Images },
      { type: 'testimonials', label: 'Omtaler', description: 'Kundesitater og anmeldelser', icon: MessageSquare },
      { type: 'stats', label: 'Tall i fokus', description: 'Statistikk og nøkkeltall', icon: BarChart3 },
    ],
  },
  {
    label: 'Kontakt og plassering',
    types: [
      { type: 'contact-info', label: 'Kontaktinformasjon', description: 'Kontaktdetaljer med ikoner', icon: Mail },
      { type: 'location', label: 'Lokasjon', description: 'Adresse og kart', icon: MapPin },
      { type: 'newsletter', label: 'Nyhetsbrev', description: 'Påmelding til nyhetsbrev', icon: Newspaper },
    ],
  },
  {
    label: 'Automatisk innhold',
    types: [
      { type: 'experiences-grid', label: 'Opplevelser (auto)', description: 'Henter opplevelser automatisk', icon: LayoutGrid },
      { type: 'articles-grid', label: 'Artikler (auto)', description: 'Henter artikler automatisk', icon: FileText },
      { type: 'products-grid', label: 'Produkter (auto)', description: 'Henter produkter automatisk', icon: ShoppingBag },
      { type: 'categories', label: 'Opplevelseskategorier (auto)', description: 'Henter kategorier automatisk', icon: LayoutList },
    ],
  },
  {
    label: 'Dekorasjon',
    types: [
      { type: 'trust-bar', label: 'Tillitsbar', description: 'Ikoner for tillit og trygghet', icon: Shield },
      { type: 'video', label: 'Video', description: 'YouTube eller Vimeo embed', icon: Video },
      { type: 'logo-bar', label: 'Partnere / Omtalt i', description: 'Logoer fra samarbeidspartnere', icon: Building2 },
    ],
  },
]

export function SectionTypePicker({ isOpen, onClose, onSelect }: SectionTypePickerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingId = 'section-type-picker-heading'

  useEffect(() => {
    if (!isOpen) return

    // Focus dialog on open
    const timer = setTimeout(() => {
      dialogRef.current?.focus()
    }, 0)

    // Escape key handler
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-cream p-6 shadow-xl focus:outline-none"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id={headingId} className="font-heading text-h3 font-bold text-forest">
            Velg seksjonstype
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-body/50 hover:bg-card hover:text-body"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Groups */}
        {SECTION_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-label uppercase tracking-wider text-body/50 mt-4 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.types.map(({ type, label, description, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onSelect(type)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-card"
                >
                  <Icon className="h-6 w-6 shrink-0 text-forest" />
                  <div className="min-w-0">
                    <span className="block font-medium text-body text-forest">{label}</span>
                    <span className="block text-sm text-body/50">{description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
