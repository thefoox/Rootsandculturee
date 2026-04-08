import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Heart, Layers, CheckCircle, ArrowRight } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { getProducts } from '@/lib/data/products'
import { getArticles } from '@/lib/data/articles'
import { getPageContent } from '@/lib/data/page-content'
import { FilterableExperienceGrid } from '@/components/experiences/FilterableExperienceGrid'
import { formatPrice } from '@/lib/format'
import type { Experience, ExperienceDate, PageSection } from '@/types'

function findSection(sections: PageSection[], type: string): PageSection | undefined {
  return sections.find((s) => s.type === type)
}

export const metadata: Metadata = {
  title: 'Roots & Culture — Norske natur- og kulturopplevelser',
  description:
    'Oppdag autentiske norske naturopplevelser, kurs og matkultur. Kjøp produkter fra norsk natur og bestill din neste opplevelse.',
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
    desc: 'Lær å sanke urter og opplev naturen',
    image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-07-desktop.webp',
    href: '/opplevelser/kurs',
  },
  {
    title: 'Matopplevelser',
    desc: 'Smak på norske tradisjoner',
    image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-07-desktop.webp',
    href: '/opplevelser/matopplevelse',
  },
]

const TESTIMONIALS = [
  {
    quote: 'En helt magisk opplevelse. Å være ute i skogen med kunnskapsrike guider ga meg en ny respekt for norsk natur.',
    author: 'Kari Nordmann',
    role: 'Deltaker, Tidlig Vår-retreat',
  },
  {
    quote: 'Vi tok med hele teamet på bedriftsretreat. Fantastisk organisert og perfekt balanse mellom aktivitet og ro.',
    author: 'Erik Hansen',
    role: 'CEO, Innovasjon AS',
  },
  {
    quote: 'Produktene er av topp kvalitet. Tors Ild er blitt min favoritt for mørke kvelder.',
    author: 'Inger Larsen',
    role: 'Kunde siden 2024',
  },
]

export default async function Home() {
  const [experiences, products, articles, pageContent] = await Promise.all([
    getExperiences(),
    getProducts(),
    getArticles(),
    getPageContent('forside'),
  ])

  const sections = pageContent?.sections ?? []
  const heroSection = findSection(sections, 'hero')
  const trustSection = findSection(sections, 'trust-bar')
  const ctaSection = findSection(sections, 'cta')

  const experiencesWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      experiences.map(async (exp) => {
        const dates = await getExperienceDates(exp.id)
        return { ...exp, nextDate: dates[0] || undefined }
      })
    )

  return (
    <>
      {/* ═══ HERO: Fullscreen ═══ */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroSection?.image?.url || '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-20-desktop.webp'}
            alt={heroSection?.image?.alt || 'Gruppe på tur i norsk skog'}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/20 via-forest/50 to-forest/75" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-20 md:px-8 md:pb-24">
          <h1 className="max-w-[700px] font-heading text-hero font-bold leading-[1.02] tracking-tighter text-cream">
            {heroSection?.heading || 'Velkommen til Roots\u00a0&\u00a0Culture'}
          </h1>
          <p className="mt-5 max-w-[520px] font-body text-lg leading-relaxed text-cream/85">
            {heroSection?.subheading || 'Gjennom våre tjenester arbeider vi for å øke bevisstheten om natur, tradisjon og kultur.'}
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link
              href="/opplevelser"
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-8 py-4 font-body text-body font-semibold text-cream shadow-lg shadow-black/15 motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Se tilgjengelige opplevelser <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/produkter"
              className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-cream/50 bg-cream/8 px-8 py-4 font-body text-body font-medium text-cream backdrop-blur-sm motion-safe:transition-all motion-safe:duration-200 hover:border-cream hover:bg-cream/15"
            >
              Besøk butikk
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/40">
          <svg className="h-7 w-7 motion-safe:animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="border-t border-cream/5 bg-forest py-7">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-10 px-6 md:px-8">
          {[
            { icon: Shield, label: 'Trygg betaling' },
            { icon: Heart, label: 'Norsk kvalitet' },
            { icon: Layers, label: 'Lokale guider' },
            { icon: CheckCircle, label: 'Gratis kansellering' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-cream/65">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-label font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ KATEGORIER ═══ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              Utforsk våre kategorier
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

      {/* ═══ OPPLEVELSER: Filtrerbare kort ═══ */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <FilterableExperienceGrid
            experiences={experiencesWithDates}
            title="Kurs og Retreater"
            subtitle="Book din neste naturopplevelse"
          />
        </div>
      </section>

      {/* ═══ PRODUKTER ═══ */}
      {products.length > 0 && (
        <section className="bg-cream py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                Produkter fra norsk natur
              </h2>
              <Link
                href="/produkter"
                className="mt-2.5 inline-flex items-center gap-1.5 text-label font-medium text-forest hover:underline"
              >
                Se alle produkter <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products.slice(0, 4).map((product) => {
                const img = product.images[0]
                return (
                  <Link
                    key={product.id}
                    href={`/produkter/${product.slug}`}
                    className="group overflow-hidden rounded-2xl bg-card motion-safe:transition-all motion-safe:duration-250 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(27,67,50,0.1)]"
                  >
                    <div className="aspect-square overflow-hidden">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.alt}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-400 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card text-body/40">
                          Ingen bilde
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-[0.6875rem] font-semibold uppercase tracking-wider text-bark">
                        {product.category === 'drikke' ? 'Drikke' : product.category === 'kaffe-te' ? 'Kaffe & Te' : 'Naturprodukter'}
                      </div>
                      <h4 className="mt-1 font-heading text-h4 font-bold text-forest">
                        {product.name}
                      </h4>
                      <div className="mt-2 font-body text-h4 font-bold text-forest">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TESTIMONIALS ═══ */}
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

      {/* ═══ BLOGG ═══ */}
      {articles.length > 0 && (
        <section className="bg-cream py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                Fra bloggen
              </h2>
              <Link
                href="/blogg"
                className="mt-2.5 inline-flex items-center gap-1.5 text-label font-medium text-forest hover:underline"
              >
                Les alle artikler <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {articles.slice(0, 3).map((article, i) => {
                const img = article.coverImage
                return (
                  <Link
                    key={article.id}
                    href={`/blogg/${article.slug}`}
                    className="group overflow-hidden rounded-2xl bg-card motion-safe:transition-all motion-safe:duration-250 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(27,67,50,0.08)]"
                  >
                    <div className={`overflow-hidden ${i === 0 ? 'h-60' : 'aspect-[16/10]'}`}>
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.alt}
                          width={600}
                          height={400}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card text-body/40">
                          Ingen bilde
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-[0.6875rem] font-semibold uppercase tracking-wider text-bark">
                        {article.tags?.[0] || 'Artikkel'}
                      </div>
                      <h3 className="mt-2 font-heading text-h4 font-bold leading-snug text-forest">
                        {article.title}
                      </h3>
                      {article.metaDescription && (
                        <p className="mt-2 line-clamp-2 text-label leading-relaxed text-body/60">
                          {article.metaDescription}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ NYHETSBREV ═══ */}
      <section className="bg-forest py-20 text-center">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="font-heading text-h2 font-bold tracking-tight text-cream">
            Hold deg oppdatert
          </h2>
          <p className="mt-2 text-body text-cream/65">
            Få beskjed om nye opplevelser og sesong-tips
          </p>
          <div className="mx-auto mt-7 flex max-w-[480px] gap-3 rounded-xl border border-cream/10 bg-cream/8 p-1.5">
            <input
              type="email"
              placeholder="Din e-postadresse"
              className="flex-1 bg-transparent px-4 py-3.5 font-body text-body text-cream outline-none placeholder:text-cream/35"
              aria-label="E-postadresse for nyhetsbrev"
            />
            <button className="whitespace-nowrap rounded-lg bg-cream px-6 py-3.5 text-label font-semibold text-forest motion-safe:transition-opacity hover:opacity-90">
              Meld meg på
            </button>
          </div>
          <p className="mt-3 text-[0.75rem] text-cream/35">
            Vi sender maks 2 e-poster i måneden. Ingen spam.
          </p>
        </div>
      </section>
    </>
  )
}
