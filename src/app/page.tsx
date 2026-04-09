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

  const sortedSections = [...pageContent.sections].sort((a, b) => a.order - b.order)

  // Extract CMS sections by type for explicit ordering matching forside-v4.html
  const heroSection = sortedSections.find((s) => s.type === 'hero')
  const trustBarSection = sortedSections.find((s) => s.type === 'trust-bar')
  const experiencesSection = sortedSections.find((s) => s.type === 'experiences-grid')
  const productsSection = sortedSections.find((s) => s.type === 'products-grid')
  const articlesSection = sortedSections.find((s) => s.type === 'articles-grid')
  const ctaSection = sortedSections.find((s) => s.type === 'cta')

  return (
    <>
      {/* 1. Hero (CMS) — fullscreen, dual CTA */}
      {heroSection && <SectionRenderer section={heroSection} />}

      {/* 2. Trust bar (CMS) — dark, 4 items */}
      {trustBarSection && <SectionRenderer section={trustBarSection} />}

      {/* 3. Categories (page-level) — 3 cards, 3/4 aspect ratio */}
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

      {/* 4. Experiences (CMS) — filter tabs + detailed cards */}
      {experiencesSection && <SectionRenderer section={experiencesSection} />}

      {/* 5. Products (CMS) — 4-column grid */}
      {productsSection && <SectionRenderer section={productsSection} />}

      {/* 6. Testimonials (page-level) — 3 cards with stars */}
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

      {/* 7. Blog (CMS) — 3-column grid, first featured */}
      {articlesSection && <SectionRenderer section={articlesSection} />}

      {/* 8. Newsletter (page-level) — dark forest bg */}
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

      {/* 9. CTA banner (CMS) — bg image */}
      {ctaSection && <SectionRenderer section={ctaSection} />}
    </>
  )
}
