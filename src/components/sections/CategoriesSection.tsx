import Image from 'next/image'
import Link from 'next/link'
import type { PageSection } from '@/types'

const CATEGORIES = [
  {
    title: 'Naturretreater',
    description: 'Koble av i naturen med guidede retreater og meditasjonsopplevelser.',
    href: '/opplevelser/retreat',
    image: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-20-desktop.webp',
  },
  {
    title: 'Kurs',
    description: 'Lær å bruke urter, lage mat og oppleve naturen på nært hold.',
    href: '/opplevelser/kurs',
    image: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-01-desktop.webp',
  },
  {
    title: 'Matopplevelser',
    description: 'Smak på norske mattradisjoner med lokale råvarer fra gård og natur.',
    href: '/opplevelser/matopplevelse',
    image: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-06-desktop.webp',
  },
]

export function CategoriesSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="mt-3 text-body leading-relaxed text-body/70">
                {section.subheading}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {CATEGORIES.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group overflow-hidden rounded-xl bg-white shadow-sm motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-[17px] font-bold text-forest">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-body/70">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
