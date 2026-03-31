import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, CalendarDays } from 'lucide-react'
import { getProducts } from '@/lib/data/products'
import { getExperiences } from '@/lib/data/experiences'
import { getExperienceDates } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'
import { getPageContent, getSection } from '@/lib/data/page-content'
import { formatPrice, formatDate } from '@/lib/format'
import { BlogCard } from '@/components/blog/BlogCard'

export default async function Home() {
  const [products, experiences, articles, page] = await Promise.all([
    getProducts(),
    getExperiences(),
    getArticles(),
    getPageContent('forside'),
  ])

  const experiencesWithDates = await Promise.all(
    experiences.slice(0, 3).map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  const hero = getSection(page, 'hero')
  const oppHeading = getSection(page, 'opplevelser-heading')
  const prodHeading = getSection(page, 'produkter-heading')
  const omOss = getSection(page, 'om-oss')
  const bloggHeading = getSection(page, 'blogg-heading')
  const ctaBanner = getSection(page, 'cta-banner')

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen items-center">
        <Image
          src={hero?.image?.url || '/bilder-brukt-paa-sidene/forside/retreat-22-desktop.webp'}
          alt={hero?.image?.alt || ''}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Diagonal gradient: dark bottom-left to transparent top-right */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.1) 100%)' }}
        />

        <div className="relative mx-auto w-full max-w-[1200px] px-6 pt-28 md:px-8">
          <h1 className="max-w-3xl font-heading text-h1 font-bold leading-[1.08] text-cream whitespace-pre-line">
            {hero?.heading || 'Velkommen til\nRoots & Culture'}
          </h1>
          <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-cream/90 ">
            {hero?.subheading || 'Gjennom våre tjenester arbeider vi for å øke bevissthet om natur, tradisjon og kultur.'}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/opplevelser"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/85"
            >
              Se tilgjengelige opplevelser
            </Link>
            <Link
              href="/produkter"
              className="inline-flex items-center gap-2 rounded-full border-2 border-cream/70 px-7 py-3.5 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-cream/10 hover:border-cream"
            >
              Besøk butikk
            </Link>
          </div>
        </div>
      </section>

      {/* ============ OPPLEVELSER ============ */}
      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-h1 font-bold text-forest ">
                {oppHeading?.heading || 'Opplevelser'}
              </h2>
              <p className="mt-2 max-w-md font-body text-body">
                {oppHeading?.subheading || 'Naturretreater, kurs og matopplevelser som bringer deg nærmere norsk natur og kulturarv'}
              </p>
            </div>
            <Link
              href="/opplevelser"
              className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
            >
              Se alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {experiencesWithDates.map(({ experience, nextDate }) => {
              const mainImage = experience.images[0]
              return (
                <Link
                  key={experience.id}
                  href={`/opplevelser/${experience.slug}`}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[3/4]">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.alt}
                        fill
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="font-heading text-h3 font-bold leading-tight text-cream ">
                      {experience.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-cream/80">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {experience.location}
                      </span>
                      {nextDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(nextDate.date)}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-body text-lg font-bold text-cream">
                      fra {formatPrice(experience.basePrice)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/opplevelser"
              className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
            >
              Se alle opplevelser <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ PRODUKTER ============ */}
      <section className="bg-card py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-h1 font-bold text-forest ">
                {prodHeading?.heading || 'Produkter'}
              </h2>
              <p className="mt-2 max-w-md font-body text-body">
                {prodHeading?.subheading || 'Håndplukkede naturprodukter fra norske produsenter'}
              </p>
            </div>
            <Link
              href="/produkter"
              className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
            >
              Se alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.slice(0, 4).map((product) => {
              const mainImage = product.images[0]
              return (
                <Link
                  key={product.id}
                  href={`/produkter/${product.slug}`}
                  className="group overflow-hidden rounded-xl bg-cream shadow-sm motion-safe:transition-all motion-safe:duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.alt}
                        fill
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-cream text-body/50">
                        Bilde kommer
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-label uppercase tracking-wider text-body/60">
                      {product.category === 'drikke' ? 'Drikke' : product.category === 'kaffe-te' ? 'Kaffe & Te' : 'Naturprodukter'}
                    </p>
                    <h3 className="mt-1 font-heading text-lg font-bold leading-tight text-forest">
                      {product.name}
                    </h3>
                    <p className="mt-2 font-body text-body font-bold text-forest">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/produkter"
              className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
            >
              Se alle produkter <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ OM OSS + BILDE ============ */}
      <section className="bg-cream">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={omOss?.image?.url || '/bilder-brukt-paa-sidene/om-oss/retreat-07-desktop.webp'}
                alt={omOss?.image?.alt || 'Naturopplevelse i norsk skog'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="font-heading text-h1 font-bold text-forest ">
                {omOss?.heading || 'Forankret i norsk natur'}
              </h2>
              {omOss?.body ? (
                <div className="mt-5 font-body text-body leading-relaxed text-body" dangerouslySetInnerHTML={{ __html: omOss.body }} />
              ) : (
                <>
                  <p className="mt-5 font-body text-body leading-relaxed text-body">
                    Roots & Culture er en norsk nettbutikk som formidler håndplukkede naturprodukter og unike opplevelser fra hele Norge.
                  </p>
                  <p className="mt-4 font-body text-body leading-relaxed text-body">
                    Vårt mål er å gjøre det enkelt for deg å oppleve det beste Norge har å by på.
                  </p>
                </>
              )}
              <Link
                href="/om-oss"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-forest px-6 py-3 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/90"
              >
                Les mer om oss
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOGG ============ */}
      <section className="bg-card py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-h1 font-bold text-forest ">
                {bloggHeading?.heading || 'Fra bloggen'}
              </h2>
              <p className="mt-2 max-w-md font-body text-body">
                {bloggHeading?.subheading || 'Historier om natur, kultur og tradisjoner'}
              </p>
            </div>
            <Link
              href="/blogg"
              className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
            >
              Les alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <BlogCard key={article.id} article={article} className="bg-cream" />
            ))}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/blogg"
              className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
            >
              Les alle artikler <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative py-24 md:py-32">
        <Image
          src={ctaBanner?.image?.url || '/bilder-brukt-paa-sidene/forside/retreat-20-desktop.webp'}
          alt={ctaBanner?.image?.alt || ''}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto max-w-[700px] px-6 text-center md:px-8">
          <h2 className="font-heading text-h1 font-bold text-cream ">
            {ctaBanner?.heading || 'Klar for en opplevelse?'}
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-lg leading-relaxed text-cream/85">
            {ctaBanner?.subheading || 'Utforsk våre unike naturopplevelser og finn din neste eventyr i norsk natur.'}
          </p>
          <Link
            href="/opplevelser"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-cream px-8 py-3.5 font-body text-body font-medium text-forest motion-safe:transition-all motion-safe:duration-150 hover:bg-white"
          >
            Se opplevelser
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
