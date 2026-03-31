import Link from 'next/link'
import { getProducts } from '@/lib/data/products'
import { getExperiences } from '@/lib/data/experiences'
import { getExperienceDates } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'
import { getSiteContent } from '@/lib/data/site-content'
import { ProductCard } from '@/components/products/ProductCard'
import { ExperienceCard } from '@/components/experiences/ExperienceCard'
import { BlogCard } from '@/components/blog/BlogCard'

export default async function Home() {
  const [products, experiences, articles, siteContent] = await Promise.all([
    getProducts(),
    getExperiences(),
    getArticles(),
    getSiteContent(),
  ])

  // Get the first upcoming date for each experience (for the card display)
  const experiencesWithDates = await Promise.all(
    experiences.slice(0, 2).map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  const heroTitle = siteContent?.heroTitle ?? 'Opplev ekte norsk natur og kultur'
  const heroIngress =
    siteContent?.heroIngress ??
    'Vi bringer deg naermere naturen gjennom autentiske produkter og unike opplevelser forankret i norsk kulturarv.'
  const aboutText = siteContent?.aboutText ?? ''

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-forest to-forest/85">
        {/* Decorative forest pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            preserveAspectRatio="xMidYMax slice"
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Abstract tree silhouettes */}
            <path d="M100 600 L130 400 L110 420 L140 300 L120 320 L150 200 L80 320 L100 300 L70 420 L90 400 Z" fill="currentColor" className="text-cream" />
            <path d="M300 600 L330 380 L310 400 L340 260 L320 280 L350 160 L280 280 L300 260 L270 400 L290 380 Z" fill="currentColor" className="text-cream" />
            <path d="M550 600 L580 420 L560 440 L590 320 L570 340 L600 220 L530 340 L550 320 L520 440 L540 420 Z" fill="currentColor" className="text-cream" />
            <path d="M800 600 L830 370 L810 390 L840 250 L820 270 L850 140 L780 270 L800 250 L770 390 L790 370 Z" fill="currentColor" className="text-cream" />
            <path d="M1050 600 L1080 410 L1060 430 L1090 300 L1070 320 L1100 190 L1030 320 L1050 300 L1020 430 L1040 410 Z" fill="currentColor" className="text-cream" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 py-16 text-center md:px-8">
          <h1 className="mx-auto max-w-3xl font-heading text-[36px] font-bold leading-[1.2] text-cream md:text-[48px]">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-[17px] leading-relaxed text-cream/90 md:text-[19px]">
            {heroIngress}
          </p>
          <Link
            href="/produkter"
            className="mt-10 inline-block rounded-lg bg-ember px-8 py-3 font-body text-[15px] font-medium text-cream motion-safe:transition-colors motion-safe:duration-100 hover:bg-ember/90"
          >
            Utforsk produkter
          </Link>
        </div>
      </section>

      {/* Utvalgte produkter */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="font-heading text-[28px] font-bold text-forest">
            Utvalgte produkter
          </h2>
          <p className="mt-2 font-body text-[15px] text-bark">
            Håndplukkede naturprodukter fra norske produsenter
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/produkter"
              className="font-body text-[15px] font-medium text-ember hover:underline"
            >
              Se alle produkter &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Kommende opplevelser */}
      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="font-heading text-[28px] font-bold text-forest">
            Kommende opplevelser
          </h2>
          <p className="mt-2 font-body text-[15px] text-bark">
            Unike naturopplevelser og kurs over hele Norge
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {experiencesWithDates.map(({ experience, nextDate }) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                nextDate={nextDate}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/opplevelser"
              className="font-body text-[15px] font-medium text-ember hover:underline"
            >
              Se alle opplevelser &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Fra bloggen */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="font-heading text-[28px] font-bold text-forest">
            Fra bloggen
          </h2>
          <p className="mt-2 font-body text-[15px] text-bark">
            Historier om natur, kultur og tradisjoner
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/blogg"
              className="font-body text-[15px] font-medium text-ember hover:underline"
            >
              Les mer &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Om oss teaser */}
      {aboutText && (
        <section className="bg-card py-16 md:py-24">
          <div className="mx-auto max-w-[700px] px-4 text-center md:px-8">
            <h2 className="font-heading text-[28px] font-bold text-forest">
              Om oss
            </h2>
            <p className="mt-6 font-body text-[15px] leading-relaxed text-bark">
              {aboutText}
            </p>
            <Link
              href="/om-oss"
              className="mt-6 inline-block font-body text-[15px] font-medium text-ember hover:underline"
            >
              Les mer om oss &rarr;
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
