import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Compass } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { BlogCard } from '@/components/blog/BlogCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Opplevelser — Roots & Culture',
  description: 'Naturretreater, kurs og matopplevelser i norsk natur. Book din neste naturopplevelse.',
}

export const revalidate = 3600

const categories = [
  {
    title: 'Naturretreater',
    description: 'Koble av i naturen med guidede retreater og meditasjon',
    image: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-14-desktop.webp',
    href: '/opplevelser/retreat',
  },
  {
    title: 'Kurs',
    description: 'Lær å sanke urter, lage mat og opplev naturen på nært hold',
    image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-07-desktop.webp',
    href: '/opplevelser/kurs',
  },
  {
    title: 'Matopplevelser',
    description: 'Smak på norske tradisjoner med lokale råvarer fra gård og natur',
    image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-07-desktop.webp',
    href: '/opplevelser/matopplevelse',
  },
]

const faqItems = [
  { question: 'Hva inkluderer prisen?', answer: 'Prisen inkluderer alt som er listet under «Hva er inkludert» på hver opplevelse. Sjekk detaljsiden for en fullstendig liste.' },
  { question: 'Hvordan booker jeg?', answer: 'Velg en opplevelse, velg en dato, og legg den i handlekurven. Fullfør betalingen med kort — du mottar bekreftelse på e-post.' },
  { question: 'Kan jeg kansellere?', answer: 'Ja. Kanselleringsvilkårene varierer og er oppgitt på detaljsiden. Generelt tilbyr vi gratis avbestilling inntil 7–21 dager før.' },
  { question: 'Er opplevelsene tilpasset nybegynnere?', answer: 'Ja, vi har opplevelser for alle nivåer — merket med lett, moderat eller krevende.' },
  { question: 'Kan jeg gi en opplevelse i gave?', answer: 'Absolutt! Kontakt oss på post@rootsculture.no så hjelper vi deg med gavekort.' },
]

export default async function OpplevelserPage() {
  const [experiences, articles] = await Promise.all([getExperiences(), getArticles()])

  const experiencesWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      experiences.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return { ...experience, nextDate: dates[0] || undefined }
      })
    )

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-end">
        <Image
          src="/bilder-brukt-paa-sidene/opplevelser-hovedside/retreat-20-desktop.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 md:px-8 md:pb-24">
          <h1 className="max-w-2xl font-heading text-[36px] font-bold leading-[1.1] text-cream md:text-[48px]">
            Opplevelser i norsk natur
          </h1>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-cream/85">
            Naturretreater, kurs og matopplevelser som bringer deg nærmere naturen
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-8">
        <Breadcrumbs items={[{ label: 'Opplevelser' }]} />
      </div>

      {/* Intro */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 md:grid-cols-5 md:items-center md:gap-16 md:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-3">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-21-desktop.webp"
              alt="Naturopplevelse i norsk skog"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
          <div className="md:col-span-2">
            <h2 className="font-heading text-[28px] font-bold text-forest md:text-[32px]">
              Naturopplevelser som berører
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-body">
              <p>Hos Roots & Culture handler opplevelser om mer enn bare aktiviteter. Det handler om å stoppe opp, puste dypt, og kjenne forbindelsen til naturen rundt deg.</p>
              <p>Hver opplevelse er nøye kuratert av erfarne guider som deler vår lidenskap for norsk natur og kulturarv.</p>
            </div>
            <a
              href="#opplevelser"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-forest px-5 py-2.5 text-[15px] font-medium text-cream hover:bg-forest/90"
            >
              Se tilgjengelige opplevelser
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Kategorier */}
      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="text-center font-heading text-[28px] font-bold text-forest md:text-[32px]">
            Utforsk våre kategorier
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group overflow-hidden rounded-2xl bg-cream shadow-sm motion-safe:transition-all motion-safe:duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-[20px] font-bold text-forest">{cat.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-body">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kommende opplevelser */}
      <section id="opplevelser" className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <h2 className="text-center font-heading text-[28px] font-bold text-forest md:text-[32px]">
            Kommende opplevelser
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-body">
            Book din neste naturopplevelse
          </p>
          <div className="mt-10">
            {experiencesWithDates.length > 0 ? (
              <ExperienceList experiences={experiencesWithDates} />
            ) : (
              <EmptyState icon={Compass} heading="Ingen opplevelser" body="Kom tilbake snart!" />
            )}
          </div>
        </div>
      </section>

      {/* Artikler */}
      {articles.length > 0 && (
        <section className="bg-card py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-[28px] font-bold text-forest">Fra bloggen</h2>
              <Link href="/blogg" className="hidden items-center gap-1 text-[15px] font-medium text-forest hover:underline md:inline-flex">
                Les alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <BlogCard key={article.id} article={article} className="bg-cream" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-[800px] px-6 md:px-8">
          <h2 className="text-center font-heading text-[28px] font-bold text-forest">Vanlige spørsmål</h2>
          <div className="mt-8 divide-y divide-forest/10">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium text-forest [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="ml-4 shrink-0 motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-body">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
