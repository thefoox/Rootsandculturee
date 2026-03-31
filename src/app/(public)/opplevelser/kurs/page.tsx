import type { Metadata } from 'next'
import Image from 'next/image'
import { Compass } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { EmptyState } from '@/components/shared/EmptyState'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Kurs — Roots & Culture',
  description: 'Lær å sanke urter, lage mat fra naturen og opplev norsk natur på nært hold med våre kurs.',
}

export const revalidate = 3600

export default async function KursPage() {
  const allExperiences = await getExperiences()
  const kurs = allExperiences.filter((e) => e.category === 'kurs')

  const kursWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      kurs.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return { ...experience, nextDate: dates[0] || undefined }
      })
    )

  return (
    <>
      <section className="relative flex min-h-[50vh] items-end">
        <Image
          src="/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-01-desktop.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-14 md:px-8 md:pb-20">
          <h1 className="max-w-xl font-heading text-[36px] font-bold leading-[1.1] text-cream md:text-[48px]">
            Kurs
          </h1>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-cream/85">
            Lær å sanke, lage mat og opplev norsk natur på nært hold med erfarne guider.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: 'Opplevelser', href: '/opplevelser' }, { label: 'Kurs' }]} />
        </div>

        <section className="grid gap-10 py-12 md:grid-cols-5 md:items-start md:gap-16 md:py-16">
          <div className="md:col-span-3">
            <h2 className="font-heading text-[24px] font-bold text-forest">Om våre kurs</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-body">
              <p>Våre kurs gir deg praktisk kunnskap om norsk natur og tradisjoner. Med erfarne guider og botanikere lærer du å identifisere ville urter, tilberede mat fra naturen, og forstå økosystemene rundt deg.</p>
              <p>Kursene er tilpasset alle nivåer — fra nybegynnere til de som vil fordype seg. Alt utstyr og materialer er inkludert.</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:col-span-2">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-05-desktop.webp"
              alt="Kurs i urtesamling"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </section>

        <section className="border-t border-forest/10 py-12 md:py-16">
          <h2 className="font-heading text-[24px] font-bold text-forest">Tilgjengelige kurs</h2>
          <div className="mt-8">
            {kursWithDates.length > 0 ? (
              <ExperienceList experiences={kursWithDates} />
            ) : (
              <EmptyState icon={Compass} heading="Ingen kurs" body="Vi har ingen kurs tilgjengelig akkurat nå." />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
