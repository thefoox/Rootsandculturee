import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export const metadata: Metadata = {
  title: 'Roots & Culture — Norske natur- og kulturopplevelser',
  description:
    'Oppdag autentiske norske naturopplevelser, kurs og matkultur. Kjop produkter fra norsk natur og bestill din neste opplevelse.',
  openGraph: {
    title: 'Roots & Culture',
    description:
      'Oppdag autentiske norske naturopplevelser, kurs og matkultur.',
  },
}

export const revalidate = 3600

const CATEGORIES = [
  {
    title: 'Retreater',
    desc: 'Koble av i naturen med guidede retreater',
    image: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-14-desktop.webp',
    href: '/opplevelser/retreat',
  },
  {
    title: 'Kurs',
    desc: 'Laer a sanke urter og opplev naturen',
    image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-07-desktop.webp',
    href: '/opplevelser/kurs',
  },
  {
    title: 'Matopplevelser',
    desc: 'Smak pa norske tradisjoner',
    image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-07-desktop.webp',
    href: '/opplevelser/matopplevelse',
  },
]

const TESTIMONIALS = [
  {
    quote: 'En helt magisk opplevelse. A vaere ute i skogen med kunnskapsrike guider ga meg en ny respekt for norsk natur.',
    author: 'Kari Nordmann',
    role: 'Deltaker, Tidlig Var-retreat',
  },
  {
    quote: 'Vi tok med hele teamet pa bedriftsretreat. Fantastisk organisert og perfekt balanse mellom aktivitet og ro.',
    author: 'Erik Hansen',
    role: 'CEO, Innovasjon AS',
  },
  {
    quote: 'Produktene er av topp kvalitet. Tors Ild er blitt min favoritt for morke kvelder.',
    author: 'Inger Larsen',
    role: 'Kunde siden 2024',
  },
]

export default async function Home() {
  const pageContent = await getPageContent('forside')
  if (!pageContent) return <div>Innhold ikke tilgjengelig</div>

  const sortedSections = pageContent.sections.sort((a, b) => a.order - b.order)

  // Split sections: render CMS sections via SectionRenderer, interleave page-level components
  // CMS sections: hero (0), trust-bar (1), experiences-grid (2), products-grid (3), text-image (4), articles-grid (5), cta (6)
  // Page-level: categories (after trust-bar), testimonials (after articles-grid), newsletter (after cta)
  const heroSection = sortedSections.find((s) => s.type === 'hero')
  const trustBarSection = sortedSections.find((s) => s.type === 'trust-bar')
  const remainingSections = sortedSections.filter((s) => s.type !== 'hero' && s.type !== 'trust-bar')

  return (
    <>
      {/* CMS hero */}
      {heroSection && <SectionRenderer section={heroSection} />}

      {/* CMS trust bar */}
      {trustBarSection && <SectionRenderer section={trustBarSection} />}

      {/* Categories — page-level (no CMS section type) */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              Utforsk vare kategorier
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 text-cream">
                  <h3 className="font-heading text-h3 font-bold text-cream">{cat.title}</h3>
                  <p className="mt-1.5 text-label text-cream/80">{cat.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-label font-semibold text-cream opacity-0 motion-safe:translate-y-2 motion-safe:transition-all motion-safe:duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Utforsk <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CMS sections: grids, text-image, articles, cta */}
      {remainingSections.map((section) => {
        const rendered = <SectionRenderer key={section.id} section={section} />

        // Insert testimonials after articles-grid
        if (section.type === 'articles-grid') {
          return (
            <div key={section.id}>
              {rendered}

              {/* Testimonials — page-level (no CMS section type) */}
              <section className="bg-card py-24">
                <div className="mx-auto max-w-[1200px] px-6 md:px-8">
                  <div className="mb-12 text-center">
                    <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                      Hva gjestene sier
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                      <div
                        key={t.author}
                        className="rounded-2xl border border-forest/4 bg-cream p-8"
                      >
                        <div className="text-sm tracking-wider text-[var(--color-cart-badge)]">
                          &#9733;&#9733;&#9733;&#9733;&#9733;
                        </div>
                        <p className="mt-4 font-heading text-body font-light italic leading-relaxed text-forest">
                          &laquo;{t.quote}&raquo;
                        </p>
                        <div className="mt-5 text-label font-semibold">{t.author}</div>
                        <div className="text-[0.75rem] text-body/50">{t.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )
        }

        // Insert newsletter after cta
        if (section.type === 'cta') {
          return (
            <div key={section.id}>
              {rendered}

              {/* Newsletter — page-level (no CMS section type) */}
              <section className="bg-forest py-20 text-center">
                <div className="mx-auto max-w-[1200px] px-6 md:px-8">
                  <h2 className="font-heading text-h2 font-bold tracking-tight text-cream">
                    Hold deg oppdatert
                  </h2>
                  <p className="mt-2 text-body text-cream/65">
                    Fa beskjed om nye opplevelser og sesong-tips
                  </p>
                  <div className="mx-auto mt-7 flex max-w-[480px] gap-3 rounded-xl border border-cream/10 bg-cream/8 p-1.5">
                    <input
                      type="email"
                      placeholder="Din e-postadresse"
                      className="flex-1 bg-transparent px-4 py-3.5 font-body text-body text-cream outline-none placeholder:text-cream/35"
                      aria-label="E-postadresse for nyhetsbrev"
                    />
                    <button className="whitespace-nowrap rounded-lg bg-cream px-6 py-3.5 text-label font-semibold text-forest motion-safe:transition-opacity hover:opacity-90">
                      Meld meg pa
                    </button>
                  </div>
                  <p className="mt-3 text-[0.75rem] text-cream/35">
                    Vi sender maks 2 e-poster i maneden. Ingen spam.
                  </p>
                </div>
              </section>
            </div>
          )
        }

        return rendered
      })}
    </>
  )
}
