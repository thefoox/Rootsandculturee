import Image from 'next/image'
import Link from 'next/link'
import { getExperiences } from '@/lib/data/experiences'
import type { PageSection } from '@/types'

const CATEGORIES = [
  {
    title: 'Naturretreater',
    description: 'Koble av i naturen med guidede retreater og meditasjonsopplevelser.',
    href: '/opplevelser/retreat',
    category: 'retreat' as const,
  },
  {
    title: 'Kurs',
    description: 'Lær å bruke urter, lage mat og oppleve naturen på nært hold.',
    href: '/opplevelser/kurs',
    category: 'kurs' as const,
  },
  {
    title: 'Matopplevelser',
    description: 'Smak på norske mattradisjoner med lokale råvarer fra gård og natur.',
    href: '/opplevelser/matopplevelse',
    category: 'matopplevelse' as const,
  },
]

export async function CategoriesSection({ section }: { section: PageSection }) {
  // Auto-populate: fetch first experience image per category
  const experiences = await getExperiences()

  const cards = CATEGORIES.map((cat) => {
    const match = experiences.find((e) => e.category === cat.category)
    const image = match?.images?.[0] || null
    return { ...cat, image }
  })

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
          {cards.map((card) => (
            <Link
              key={card.category}
              href={card.href}
              className="group overflow-hidden rounded-xl bg-white shadow-sm motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md"
            >
              {card.image && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={card.image.url}
                    alt={card.image.alt || card.title}
                    fill
                    className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
              )}
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
