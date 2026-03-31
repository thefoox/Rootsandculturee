import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { getArticles } from '@/lib/data/articles'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { BlogCard } from '@/components/blog/BlogCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Opplevelser i norsk natur — Roots & Culture',
  description:
    'Opplev norsk natur og kultur gjennom naturretreater, kurs og matopplevelser. Book din neste naturopplevelse med Roots & Culture.',
  openGraph: {
    title: 'Opplevelser i norsk natur — Roots & Culture',
    description:
      'Opplev norsk natur og kultur gjennom naturretreater, kurs og matopplevelser. Book din neste naturopplevelse med Roots & Culture.',
  },
}

export const revalidate = 3600

const categories = [
  {
    title: 'Naturretreater',
    description: 'Koble av i naturen med guidede retreater',
    image: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-14-desktop.webp',
    imageAlt: 'Naturretreat i norsk skog',
    href: '/opplevelser?kategori=retreat',
  },
  {
    title: 'Kurs',
    description: 'L\u00e6r \u00e5 sanke, lage mat og opplev naturen',
    image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-07-desktop.webp',
    imageAlt: 'Kurs i naturen',
    href: '/opplevelser?kategori=kurs',
  },
  {
    title: 'Matopplevelser',
    description: 'Smak p\u00e5 norske tradisjoner med lokale r\u00e5varer',
    image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-07-desktop.webp',
    imageAlt: 'Matopplevelse med lokale r\u00e5varer',
    href: '/opplevelser?kategori=matopplevelse',
  },
]

const faqItems = [
  {
    question: 'Hva inkluderer prisen?',
    answer:
      'Prisen inkluderer alt som er listet under \u00abHva er inkludert\u00bb p\u00e5 hver opplevelse. Dette varierer, men omfatter vanligvis guiding, m\u00e5ltider og n\u00f8dvendig utstyr. Sjekk detaljsiden for den spesifikke opplevelsen for en fullstendig liste.',
  },
  {
    question: 'Hvordan booker jeg?',
    answer:
      'Velg en opplevelse, velg en dato som passer for deg, og legg den i handlekurven. G\u00e5 til kassen og fullf\u00f8r betalingen med Stripe. Du mottar en bekreftelse med all praktisk informasjon p\u00e5 e-post.',
  },
  {
    question: 'Kan jeg kansellere?',
    answer:
      'Ja, du kan kansellere en booking. Kanselleringsvilk\u00e5rene varierer fra opplevelse til opplevelse og er oppgitt p\u00e5 detaljsiden. Generelt tilbyr vi gratis avbestilling inntil 7\u201321 dager f\u00f8r, avhengig av opplevelsen.',
  },
  {
    question: 'Hva b\u00f8r jeg ha med?',
    answer:
      'Hver opplevelse har en detaljert liste over hva du b\u00f8r ta med. Denne finner du p\u00e5 detaljsiden under \u00abHva du b\u00f8r ta med\u00bb. Vi sender ogs\u00e5 en p\u00e5minnelse med praktisk informasjon f\u00f8r opplevelsen.',
  },
  {
    question: 'Er opplevelsene tilpasset nybegynnere?',
    answer:
      'Ja, vi har opplevelser for alle niv\u00e5er. Hver opplevelse er merket med vanskelighetsgrad \u2014 lett, moderat eller krevende \u2014 slik at du enkelt kan finne noe som passer for deg.',
  },
  {
    question: 'Kan jeg gi en opplevelse i gave?',
    answer:
      'Absolutt! Kontakt oss p\u00e5 post@rootsculture.no for \u00e5 arrangere en gaveopplevelse. Vi hjelper deg med \u00e5 finne den perfekte opplevelsen og lage et fint gavekort.',
  },
]

export default async function OpplevelserPage() {
  const [experiences, articles] = await Promise.all([
    getExperiences(),
    getArticles(),
  ])

  // Fetch the next upcoming date for each experience
  const experiencesWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      experiences.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return {
          ...experience,
          nextDate: dates[0] || undefined,
        }
      })
    )

  const topArticles = articles.slice(0, 3)

  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center">
        <Image
          src="/bilder-brukt-paa-sidene/opplevelser-hovedside/retreat-20-desktop.webp"
          alt="Opplevelser i norsk natur"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(27,67,50,0.35) 0%, rgba(27,67,50,0.75) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-24 text-center md:px-8">
          <h1 className="font-heading text-[32px] font-bold leading-tight text-cream md:text-[42px]">
            Opplevelser i norsk natur
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-cream/90">
            {'Naturretreater, kurs og matopplevelser som bringer deg n\u00e6rmere naturen og norsk kulturarv'}
          </p>
          <a
            href="#opplevelser"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-forest px-6 py-2 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-100 hover:opacity-85 active:scale-[0.98]"
          >
            Se tilgjengelige opplevelser
          </a>
        </div>
      </section>

      {/* Section 2: Intro */}
      <section className="bg-cream section-padding">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 md:grid-cols-5 md:items-center md:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:col-span-3">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-21-desktop.webp"
              alt={'Naturopplevelse som ber\u00f8rer'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
          <div className="md:col-span-2">
            <SectionHeading title={'Naturopplevelser som ber\u00f8rer'} />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-bark">
              <p>
                {'Hos Roots & Culture handler opplevelser om mer enn bare aktiviteter. Det handler om \u00e5 stoppe opp, puste dypt, og kjenne forbindelsen til naturen rundt deg \u2014 til skogen som hvisker, fjorden som speiler himmelen, og b\u00e5let som varmer.'}
              </p>
              <p>
                {'V\u00e5re opplevelser er designet for \u00e5 skape genuine forbindelser med naturen og med hverandre. Hver opplevelse er n\u00f8ye kuratert av erfarne guider som deler v\u00e5r lidenskap for norsk natur og kulturarv.'}
              </p>
              <p>
                {'Enten du s\u00f8ker ro i skogen, vil l\u00e6re om ville urter, eller dr\u00f8mmer om mat laget over b\u00e5l \u2014 vi har en opplevelse som passer for deg.'}
              </p>
            </div>
            <Link
              href="/opplevelser?kategori=retreat"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-forest px-6 py-2 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-100 hover:opacity-85 active:scale-[0.98]"
            >
              Utforsk retreater
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Category Grid */}
      <section className="bg-card section-padding">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <SectionHeading title={'Utforsk v\u00e5re kategorier'} centered />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm motion-safe:transition-all motion-safe:duration-150 hover:shadow-lg hover:scale-[1.02]"
              >
                <Image
                  src={cat.image}
                  alt={cat.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(27,67,50,0.8) 0%, rgba(27,67,50,0.1) 60%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-heading text-[22px] font-bold text-cream">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-cream/85">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Er dette noe for deg? */}
      <section className="bg-cream section-padding">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 md:grid-cols-2 md:items-center md:px-8">
          <div>
            <SectionHeading title="Er dette noe for deg?" />
            <p className="mt-6 text-[15px] leading-relaxed text-bark">
              {'V\u00e5re opplevelser passer for alle som:'}
            </p>
            <ul className="mt-4 space-y-3">
              {[
                '\u00d8nsker \u00e5 koble av fra hverdagen',
                'Er nysgjerrig p\u00e5 norsk natur og kultur',
                'Vil pr\u00f8ve noe nytt i trygge rammer',
                'Leter etter en meningsfull gave',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-bark"
                >
                  <span
                    className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-forest"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#opplevelser"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-forest px-6 py-2 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-100 hover:opacity-85 active:scale-[0.98]"
            >
              Se kommende opplevelser
            </a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-catering/catering-05-desktop.webp"
              alt={'Matopplevelse med lokale r\u00e5varer'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Section 5: Kommende opplevelser */}
      <section id="opplevelser" className="bg-card section-padding">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <SectionHeading
            title="Kommende opplevelser"
            subtitle="Book din neste naturopplevelse"
            centered
          />
          <div className="mt-12">
            {experiencesWithDates.length > 0 ? (
              <ExperienceList experiences={experiencesWithDates} />
            ) : (
              <EmptyState
                icon={Compass}
                heading="Ingen opplevelser"
                body={'Vi har ingen opplevelser tilgjengelig akkurat n\u00e5. Kom tilbake snart!'}
              />
            )}
          </div>
        </div>
      </section>

      {/* Section 6: Related Articles */}
      {topArticles.length > 0 && (
        <section className="bg-cream section-padding">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <SectionHeading
              title={'Du er kanskje ogs\u00e5 interessert i'}
              centered
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {topArticles.map((article) => (
                <BlogCard key={article.id} article={article} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/blogg"
                className="text-[15px] font-medium text-forest underline-offset-2 motion-safe:transition-colors motion-safe:duration-100 hover:text-ember hover:underline"
              >
                {'Les mer p\u00e5 bloggen \u2192'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 7: FAQ */}
      <section className="bg-card section-padding">
        <div className="mx-auto max-w-[800px] px-4 md:px-8">
          <SectionHeading
            title={'Vanlige sp\u00f8rsm\u00e5l om v\u00e5re opplevelser'}
            centered
          />
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl bg-cream"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[15px] font-medium text-forest marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    className="ml-4 shrink-0 text-bark motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-[15px] leading-relaxed text-bark">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
