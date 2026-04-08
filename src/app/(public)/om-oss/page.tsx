import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Layers, Shield, Heart, MapPin, Mail, Phone, ArrowRight } from 'lucide-react'
import { getPageContent } from '@/lib/data/page-content'
import type { PageSection } from '@/types'

function findSection(sections: PageSection[], type: string): PageSection | undefined {
  return sections.find((s) => s.type === type)
}

export const metadata: Metadata = {
  title: 'Om oss — Roots & Culture',
  description: 'Forankret i norsk natur og kulturarv. Lær mer om Roots & Culture, vår historie og hva vi står for.',
  openGraph: {
    title: 'Om oss — Roots & Culture',
    description: 'Forankret i norsk natur og kulturarv.',
  },
}

const VALUES = [
  {
    icon: Layers,
    title: 'Autentisitet',
    desc: 'Alt vi tilbyr er ekte. Ekte naturopplevelser, ekte produkter fra norsk natur, ekte mennesker som brenner for det de gjør.',
  },
  {
    icon: Shield,
    title: 'Bærekraft',
    desc: 'Vi tar vare på naturen vi lever av. Alle opplevelser og produkter er utviklet med respekt for miljøet og lokale økosystemer.',
  },
  {
    icon: Heart,
    title: 'Fellesskap',
    desc: 'Vi tror på kraften i å dele opplevelser. Våre retreater og kurs skaper rom for å møtes, lære og vokse sammen.',
  },
]

const TEAM = [
  { name: 'Navn Navnesen', role: 'Grunnlegger & Naturguide', image: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-21-desktop.webp' },
  { name: 'Navn Navnesen', role: 'Opplevelsesdesigner', image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-07-desktop.webp' },
  { name: 'Navn Navnesen', role: 'Kokk & Matformidler', image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-07-desktop.webp' },
]

export default async function OmOssPage() {
  const pageContent = await getPageContent('om-oss')
  const sections = pageContent?.sections ?? []
  const heroSection = findSection(sections, 'hero')
  const storySection = findSection(sections, 'text-image')
  const ctaSection = findSection(sections, 'cta')

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-forest text-center">
        <div className="absolute inset-0 opacity-30">
          <Image
            src={heroSection?.image?.url || '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-21-desktop.webp'}
            alt={heroSection?.image?.alt || ''}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 max-w-[640px] px-6">
          <h1 className="font-heading text-h1 font-bold leading-tight text-cream">
            {heroSection?.heading || 'Om Roots & Culture'}
          </h1>
          <p className="mt-4 font-heading text-lg font-light leading-relaxed text-cream/80">
            {heroSection?.subheading || 'Forankret i norsk natur og kulturarv'}
          </p>
        </div>
      </section>

      {/* ═══ VÅR HISTORIE: Overlapping layout ═══ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-center gap-0 md:grid-cols-[1.2fr_1fr]">
            {/* Image — overlaps into text card */}
            <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-r-3xl shadow-[24px_24px_48px_rgba(27,67,50,0.1)] md:-mr-12">
              <Image
                src={storySection?.image?.url || '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-14-desktop.webp'}
                alt={storySection?.image?.alt || 'Vår historie'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </div>
            {/* Text card */}
            <div className="relative z-20 rounded-3xl bg-card p-10 md:p-16">
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                {storySection?.heading || 'Vår historie'}
              </h2>
              {storySection?.body ? (
                <div className="mt-5 space-y-4 font-body text-body leading-relaxed text-body article-prose" dangerouslySetInnerHTML={{ __html: storySection.body }} />
              ) : (
                <div className="mt-5 space-y-4 font-body text-body leading-relaxed text-body">
                  <p>Roots & Culture ble startet med en enkel idé: å gjøre det lettere for folk å oppleve det beste av norsk natur og kulturarv.</p>
                  <p>Fra starten har vi samarbeidet med lokale produsenter, bønder og naturguider som deler vår lidenskap for norsk natur.</p>
                  <p>Enten du søker ro i skogen, vil lære om ville urter, eller drømmer om mat laget over bål — vi har noe for deg.</p>
                </div>
              )}
              <p className="mt-8 font-heading text-body font-light italic text-bark">
                — Grunnleggerne av Roots & Culture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VERDIER ═══ */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="mx-auto mb-16 max-w-[640px] text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              Hva vi står for
            </h2>
            <p className="mt-2 text-body text-body/60">
              Tre verdier som driver alt vi gjør
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-cream p-12 text-center motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-1"
              >
                <Icon className="mx-auto h-12 w-12 text-forest" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-h4 font-bold text-forest">{title}</h3>
                <p className="mt-2 text-label leading-relaxed text-body/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="mb-12 text-center font-heading text-h2 font-bold tracking-tight text-forest">
            Menneskene bak
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TEAM.map((person) => (
              <div key={person.role} className="text-center">
                <div className="mx-auto aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={person.image}
                    alt={person.name}
                    width={400}
                    height={533}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="mt-4 font-heading text-h4 font-bold text-forest">{person.name}</h4>
                <p className="mt-1 text-label text-bark">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LOKASJON ═══ */}
      <section className="bg-forest py-24 text-cream">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-h2 font-bold tracking-tight text-cream">
                Hvor du finner oss
              </h2>
              <p className="mt-4 text-body leading-relaxed text-cream/80">
                Vi holder til på Holtan Gård i Sande, Vestfold — omgitt av skog, åkerland og en av Norges vakreste kystlinjer.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: MapPin, text: 'Holtan Gård, Sande i Vestfold' },
                  { icon: Mail, text: 'post@rootsculture.no' },
                  { icon: Phone, text: '+47 123 45 678' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0 text-cream/50" aria-hidden="true" />
                    <span className="text-body text-cream/80">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-cream/10 text-label text-cream/40">
              [Kart: Sande i Vestfold]
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-card py-24 text-center">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
            Klar for en opplevelse?
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-body leading-relaxed text-body/70">
            Utforsk våre kommende opplevelser og finn noe som passer for deg.
          </p>
          <Link
            href="/opplevelser"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-forest px-8 py-4 font-body text-body font-semibold text-cream motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Se opplevelser <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
