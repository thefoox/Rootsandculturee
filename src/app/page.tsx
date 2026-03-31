import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, CalendarDays } from 'lucide-react'
import { getProducts } from '@/lib/data/products'
import { getExperiences } from '@/lib/data/experiences'
import { getExperienceDates } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'
import { getSiteContent } from '@/lib/data/site-content'
import { formatPrice, formatDate } from '@/lib/format'
import { BlogCard } from '@/components/blog/BlogCard'

export default async function Home() {
  const [products, experiences, articles, siteContent] = await Promise.all([
    getProducts(),
    getExperiences(),
    getArticles(),
    getSiteContent(),
  ])

  const experiencesWithDates = await Promise.all(
    experiences.slice(0, 3).map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  const heroTitle = siteContent?.heroTitle ?? 'Opplev ekte norsk natur og kultur'
  const heroIngress =
    siteContent?.heroIngress ??
    'Vi bringer deg nærmere naturen gjennom autentiske produkter og unike opplevelser forankret i norsk kulturarv.'
  const aboutText = siteContent?.aboutText ?? ''

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[85vh] items-end">
        <Image
          src="/bilder-brukt-paa-sidene/forside/retreat-22-desktop.webp"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-20 md:px-8 md:pb-28">
          <h1 className="max-w-2xl font-heading text-[40px] font-bold leading-[1.1] text-cream md:text-[56px]">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-lg font-body text-[17px] leading-relaxed text-cream/85 md:text-[18px]">
            {heroIngress}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/opplevelser"
              className="inline-flex items-center gap-2 rounded-md bg-cream px-6 py-3 font-body text-[15px] font-medium text-forest motion-safe:transition-all motion-safe:duration-150 hover:bg-white"
            >
              Se opplevelser
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/produkter"
              className="inline-flex items-center gap-2 rounded-md border-2 border-cream/60 px-6 py-3 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:border-cream hover:bg-cream/10"
            >
              Utforsk produkter
            </Link>
          </div>
        </div>
      </section>

      {/* ============ OPPLEVELSER ============ */}
      <section className="bg-cream py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-[32px] font-bold text-forest md:text-[36px]">
                Opplevelser
              </h2>
              <p className="mt-2 max-w-md font-body text-[15px] text-body">
                Naturretreater, kurs og matopplevelser som bringer deg nærmere norsk natur og kulturarv
              </p>
            </div>
            <Link
              href="/opplevelser"
              className="hidden font-body text-[15px] font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
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
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="font-heading text-[22px] font-bold leading-tight text-cream md:text-[24px]">
                      {experience.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-cream/80">
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
                    <p className="mt-3 font-body text-[17px] font-bold text-cream">
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
              className="inline-flex items-center gap-1 font-body text-[15px] font-medium text-forest hover:underline"
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
              <h2 className="font-heading text-[32px] font-bold text-forest md:text-[36px]">
                Produkter
              </h2>
              <p className="mt-2 max-w-md font-body text-[15px] text-body">
                Håndplukkede naturprodukter fra norske produsenter
              </p>
            </div>
            <Link
              href="/produkter"
              className="hidden font-body text-[15px] font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
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
                    <p className="text-[11px] uppercase tracking-wider text-body/60">
                      {product.category === 'drikke' ? 'Drikke' : product.category === 'kaffe-te' ? 'Kaffe & Te' : 'Naturprodukter'}
                    </p>
                    <h3 className="mt-1 font-heading text-[17px] font-bold leading-tight text-forest">
                      {product.name}
                    </h3>
                    <p className="mt-2 font-body text-[15px] font-bold text-forest">
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
              className="inline-flex items-center gap-1 font-body text-[15px] font-medium text-forest hover:underline"
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
                src="/bilder-brukt-paa-sidene/om-oss/retreat-07-desktop.webp"
                alt="Naturopplevelse i norsk skog"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="font-heading text-[32px] font-bold text-forest md:text-[36px]">
                Forankret i norsk natur
              </h2>
              <p className="mt-5 font-body text-[15px] leading-relaxed text-body">
                {aboutText || 'Roots & Culture er en norsk nettbutikk som formidler håndplukkede naturprodukter og unike opplevelser fra hele Norge. Vi samarbeider med lokale produsenter, bønder og guider som deler vår lidenskap for norsk natur og kulturarv.'}
              </p>
              <p className="mt-4 font-body text-[15px] leading-relaxed text-body">
                Vårt mål er å gjøre det enkelt for deg å oppleve det beste Norge har å by på — enten det er gjennom en kopp urte-te fra fjellet eller et retreat ved fjorden.
              </p>
              <Link
                href="/om-oss"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-forest px-6 py-3 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/90"
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
              <h2 className="font-heading text-[32px] font-bold text-forest md:text-[36px]">
                Fra bloggen
              </h2>
              <p className="mt-2 max-w-md font-body text-[15px] text-body">
                Historier om natur, kultur og tradisjoner
              </p>
            </div>
            <Link
              href="/blogg"
              className="hidden font-body text-[15px] font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
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
              className="inline-flex items-center gap-1 font-body text-[15px] font-medium text-forest hover:underline"
            >
              Les alle artikler <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative py-24 md:py-32">
        <Image
          src="/bilder-brukt-paa-sidene/forside/retreat-20-desktop.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="relative mx-auto max-w-[700px] px-6 text-center md:px-8">
          <h2 className="font-heading text-[32px] font-bold text-cream md:text-[40px]">
            Klar for en opplevelse?
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-[17px] leading-relaxed text-cream/85">
            Utforsk våre unike naturopplevelser og finn din neste eventyr i norsk natur.
          </p>
          <Link
            href="/opplevelser"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-cream px-8 py-3.5 font-body text-[15px] font-medium text-forest motion-safe:transition-all motion-safe:duration-150 hover:bg-white"
          >
            Se opplevelser
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
