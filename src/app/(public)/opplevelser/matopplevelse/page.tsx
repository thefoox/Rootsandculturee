import type { Metadata } from 'next'
import Image from 'next/image'
import { Compass } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { EmptyState } from '@/components/shared/EmptyState'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Matopplevelser — Roots & Culture',
  description: 'Smak på norske tradisjoner med matlagingskurs, gårdsmat og lokale råvarer fra norsk natur.',
}

export const revalidate = 3600

export default async function MatopplevelsePage() {
  const allExperiences = await getExperiences()
  const mat = allExperiences.filter((e) => e.category === 'matopplevelse')

  const matWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      mat.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return { ...experience, nextDate: dates[0] || undefined }
      })
    )

  return (
    <>
      <section className="relative flex min-h-[50vh] items-end">
        <Image
          src="/bilder-brukt-paa-sidene/opplevelser-catering/catering-06-desktop.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-14 md:px-8 md:pb-20">
          <h1 className="max-w-xl font-heading text-[36px] font-bold leading-[1.1] text-cream md:text-[48px]">
            Matopplevelser
          </h1>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-cream/85">
            Smak på norske tradisjoner med matlagingskurs og lokale råvarer fra gård og natur.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: 'Opplevelser', href: '/opplevelser' }, { label: 'Matopplevelser' }]} />
        </div>

        <section className="grid gap-10 py-12 md:grid-cols-5 md:items-start md:gap-16 md:py-16">
          <div className="md:col-span-3">
            <h2 className="font-heading text-[24px] font-bold text-forest">Om våre matopplevelser</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-body">
              <p>Våre matopplevelser tar deg med til tradisjonelle norske gårder der du lærer å lage klassiske retter med lokale råvarer. Fra flatbrød på takke til moderne desserter med ville bær.</p>
              <p>Alt fra råvarer til oppskrifthefte er inkludert. Du trenger ingen forkunnskaper — bare en appetitt for norsk matkultur.</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:col-span-2">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-catering/catering-03-desktop.webp"
              alt="Matlaging med lokale råvarer"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </section>

        <section className="border-t border-forest/10 py-12 md:py-16">
          <h2 className="font-heading text-[24px] font-bold text-forest">Tilgjengelige matopplevelser</h2>
          <div className="mt-8">
            {matWithDates.length > 0 ? (
              <ExperienceList experiences={matWithDates} />
            ) : (
              <EmptyState icon={Compass} heading="Ingen matopplevelser" body="Vi har ingen matopplevelser tilgjengelig akkurat nå." />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
