import type { Metadata } from 'next'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { ContactForm } from './ContactForm'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med sporsmal om produkter, opplevelser og bestillinger.',
  openGraph: {
    title: 'Kontakt oss — Roots & Culture',
    description: 'Ta kontakt med oss. Vi horer gjerne fra deg.',
  },
}

export default async function KontaktPage() {
  const page = await getPageContent('kontakt')
  if (!page) return <div>Innhold ikke tilgjengelig</div>

  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order)

  // Split sections: render hero + contact-info first, then insert form, then faq + location
  const beforeForm = sortedSections.filter(
    (s) => s.type === 'hero' || s.type === 'contact-info'
  )
  const afterForm = sortedSections.filter(
    (s) => s.type !== 'hero' && s.type !== 'contact-info'
  )

  return (
    <>
      {/* Hero + Contact cards (overlapping) */}
      {beforeForm.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      {/* Form section -- page-level component matching kontakt-v2.html */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid items-start gap-16 max-md:grid-cols-1 md:grid-cols-2">
            {/* Left: intro text */}
            <div>
              <h2
                className="font-heading font-bold text-forest"
                style={{ fontSize: 'clamp(1.5rem, 1.3rem + 0.6vw, 1.75rem)' }}
              >
                Send oss en melding
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-[1.65]">
                Fortell oss hva du lurer pa, sa svarer vi sa raskt vi kan. Vi
                elsker a hore fra folk som deler var lidenskap for norsk natur.
              </p>
              <div className="mt-6 rounded-xl bg-card p-5 text-[0.875rem] leading-[1.6]">
                <strong className="text-forest">Bedriftsarrangementer?</strong>
                <br />
                Vi skreddersyr opplevelser for grupper og bedrifter. Fortell oss
                om onskene deres i skjemaet, sa lager vi et uforpliktende
                tilbud.
              </div>
            </div>

            {/* Right: ContactForm */}
            <div className="rounded-2xl bg-card p-8 md:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + Location */}
      {afterForm.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  )
}
