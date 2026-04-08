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

  const sortedSections = page.sections.sort((a, b) => a.order - b.order)

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      {/* Contact form — interactive client component, not part of CMS sections */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-start gap-16 md:grid-cols-[1.2fr_1fr]">
            <div className="pt-4">
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                Send oss en melding
              </h2>
              <p className="mt-3 text-body leading-relaxed text-body/70">
                Fortell oss hva du lurer pa, sa svarer vi sa raskt vi kan. Vi elsker a hore fra folk som deler var lidenskap for norsk natur.
              </p>
              <div className="mt-6 rounded-xl bg-card p-5">
                <p className="text-label leading-relaxed">
                  <span className="font-semibold text-forest">Bedriftsarrangementer?</span>
                  <br />
                  Vi skreddersyr opplevelser for grupper og bedrifter. Fortell oss om onskene deres i skjemaet, sa lager vi et uforpliktende tilbud.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-card p-8 md:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
