import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getExperienceBySlug, getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { DifficultyBadge } from '@/components/experiences/DifficultyBadge'
import { DateCardPicker } from '@/components/experiences/DateCardPicker'
import { formatPrice } from '@/lib/format'
import { MapPin, Clock, CheckCircle, Backpack, ShieldCheck } from 'lucide-react'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)

  if (!experience) {
    return { title: 'Opplevelse ikke funnet — Roots & Culture' }
  }

  return {
    title: `${experience.name} — Roots & Culture`,
    description: experience.description,
    openGraph: {
      title: experience.name,
      description: experience.description,
      images: experience.images[0]?.url ? [{ url: experience.images[0].url }] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const experiences = await getExperiences()
  return experiences.map((e) => ({ slug: e.slug }))
}

export default async function OpplevelsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)

  if (!experience) {
    notFound()
  }

  const dates = await getExperienceDates(experience.id)
  const mainImage = experience.images[0]
  const galleryImages = experience.images.slice(1)

  return (
    <>
      {/* ── Hero Section (full-width) ── */}
      {mainImage && (
        <div className="relative w-full h-[340px] md:h-[520px] lg:h-[620px]">
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        <div className="absolute inset-0 bg-black/25" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="mx-auto max-w-[1200px] px-4 md:px-8">
              <h1 className="font-heading text-h1  font-bold text-cream leading-tight">
                {experience.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-cream/90 font-body text-body">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {experience.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {experience.durationText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Bar ── */}
      <div className="bg-cream border-b border-forest/8">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="pt-4">
            <Breadcrumbs
              items={[
                { label: 'Opplevelser', href: '/opplevelser' },
                { label: experience.name },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6 py-5">
            <span className="font-heading text-h3 font-bold text-forest">
              {formatPrice(experience.basePrice)}
            </span>
            <DifficultyBadge difficulty={experience.difficulty} />
            <span className="flex items-center gap-1.5 font-body text-body">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {experience.durationText}
            </span>
            <span className="flex items-center gap-1.5 font-body text-body">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {experience.location}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description + Sidebar ── */}
      <div className="bg-cream">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            {/* Left column: content (65%) */}
            <div className="lg:w-[65%]">
              {/* Description */}
              <section>
                <h2 className="font-heading text-h3 font-bold text-forest">
                  Om opplevelsen
                </h2>
                <p className="mt-4 font-body text-body leading-[1.7] text-forest">
                  {experience.description}
                </p>
              </section>

              {/* What is included */}
              {experience.whatIsIncluded.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-heading text-h4 font-bold text-forest">
                    Hva er inkludert
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {experience.whatIsIncluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle
                          className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-badge-easy"
                          aria-hidden="true"
                        />
                        <span className="font-body text-body text-forest">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* What to bring */}
              {experience.whatToBring && (
                <section className="mt-10">
                  <h2 className="flex items-center gap-2 font-heading text-h4 font-bold text-forest">
                    <Backpack className="h-5 w-5 text-body" aria-hidden="true" />
                    Hva du bor ta med
                  </h2>
                  <p className="mt-4 font-body text-body leading-[1.7] text-forest">
                    {experience.whatToBring}
                  </p>
                </section>
              )}

              {/* Cancellation policy */}
              {experience.cancellationPolicy && (
                <section className="mt-10">
                  <h2 className="flex items-center gap-2 font-heading text-h4 font-bold text-forest">
                    <ShieldCheck className="h-5 w-5 text-body" aria-hidden="true" />
                    Kanselleringsvilkar
                  </h2>
                  <p className="mt-4 font-body text-body leading-[1.7] text-forest">
                    {experience.cancellationPolicy}
                  </p>
                </section>
              )}
            </div>

            {/* Right sidebar: booking widget (35%) */}
            <div className="lg:w-[35%]">
              <div className="lg:sticky lg:top-8">
                <div className="rounded-xl border border-forest/8 bg-card p-6">
                  <h2 className="font-heading text-lg font-bold text-forest">
                    Bestill opplevelse
                  </h2>
                  <DateCardPicker
                    experienceId={experience.id}
                    dates={dates.map((d) => ({
                      ...d,
                      date: d.date instanceof Date ? d.date : new Date(d.date),
                    }))}
                    experience={experience}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Gallery ── */}
      {galleryImages.length > 0 && (
        <div className="bg-card">
          <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
            <h2 className="font-heading text-h3 font-bold text-forest">
              Bilder
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Location Section ── */}
      <div className="bg-cream">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
          <h2 className="font-heading text-h3 font-bold text-forest">
            Sted
          </h2>
          <div className="mt-4 flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest" aria-hidden="true" />
            <div>
              <p className="font-body text-body font-medium text-forest">
                {experience.location}
              </p>
              <p className="mt-2 font-body text-body leading-[1.7] text-body">
                Opplevelsen finner sted i {experience.location}. Detaljert
                veibeskrivelse og oppmotested sendes per e-post etter
                bekreftet booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
