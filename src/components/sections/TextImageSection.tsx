import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize'
import type { PageSection } from '@/types'

function SectionImage({ section, className, sizes }: { section: PageSection; className?: string; sizes?: string }) {
  if (!section.image) return <div className={`h-full w-full bg-card ${className ?? ''}`} />
  return (
    <Image
      src={section.image.url}
      alt={section.image.alt}
      fill
      className={`object-cover ${className ?? ''}`}
      sizes={sizes || '(max-width: 768px) 100vw, 55vw'}
    />
  )
}

function TextContent({ section, dark }: { section: PageSection; dark?: boolean }) {
  const headingColor = dark ? 'text-cream' : 'text-forest'
  const bodyColor = dark ? 'text-cream/85' : 'text-body'
  const sigColor = dark ? 'text-cream/60' : 'text-bark'
  const ctaBg = dark ? 'bg-cream text-forest' : 'bg-forest text-cream'

  return (
    <>
      {section.heading && (
        <h2
          className={`font-heading font-bold ${headingColor}`}
          style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2rem)' }}
        >
          {section.heading}
        </h2>
      )}
      {section.body && (
        <div
          className={`mt-4 text-[0.9375rem] leading-[1.65] ${bodyColor} [&>p]:mt-4 [&>p:first-child]:mt-0`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
        />
      )}
      {section.subheading && (
        <p className={`mt-8 font-heading text-[0.9375rem] font-light italic ${sigColor}`}>
          {section.subheading}
        </p>
      )}
      {section.ctaText && section.ctaLink && (
        <Link
          href={section.ctaLink}
          className={`mt-8 inline-flex items-center gap-2 rounded-[10px] ${ctaBg} px-6 py-3 text-[0.9375rem] font-semibold motion-safe:transition-all hover:-translate-y-0.5 hover:opacity-90`}
        >
          {section.ctaText}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </>
  )
}

// --- Layout: Overlap (default / original) ---
function OverlapLayout({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className={`items-center md:grid md:gap-0 ${
          imageOnRight ? 'md:grid-cols-[1fr_1.2fr]' : 'md:grid-cols-[1.2fr_1fr]'
        }`}>
          <div className={`relative overflow-hidden max-md:aspect-video ${
            imageOnRight
              ? 'md:order-2 md:ml-[-48px] md:rounded-l-none md:rounded-r-3xl'
              : 'md:order-1 md:mr-[-48px] md:rounded-l-none md:rounded-r-3xl'
          } md:z-[1] md:aspect-[4/5] md:shadow-[24px_24px_48px_rgba(27,67,50,0.1)]`}>
            <SectionImage section={section} />
          </div>
          <div className={`relative bg-card max-md:p-8 md:z-[2] md:rounded-3xl md:p-16 ${
            imageOnRight ? 'md:order-1' : 'md:order-2'
          }`}>
            <TextContent section={section} />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Layout: Split (clean 50/50, no overlap) ---
function SplitLayout({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className={`md:grid md:min-h-[500px] ${
          imageOnRight ? 'md:grid-cols-[1fr_1.15fr]' : 'md:grid-cols-[1.15fr_1fr]'
        }`}>
          <div className={`relative overflow-hidden max-md:aspect-video md:h-full ${
            imageOnRight ? 'md:order-2' : 'md:order-1'
          }`}>
            <SectionImage section={section} sizes="(max-width: 768px) 100vw, 55vw" />
          </div>
          <div className={`flex flex-col justify-center bg-card max-md:p-8 md:p-16 ${
            imageOnRight ? 'md:order-1' : 'md:order-2'
          }`}>
            <TextContent section={section} />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Layout: Contained (image + text inside one card) ---
function ContainedLayout({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className={`overflow-hidden rounded-3xl bg-card md:grid md:min-h-[480px] ${
          imageOnRight ? 'md:grid-cols-[1fr_1.15fr]' : 'md:grid-cols-[1.15fr_1fr]'
        }`}>
          <div className={`relative overflow-hidden max-md:aspect-video md:m-4 md:h-auto md:rounded-2xl ${
            imageOnRight ? 'md:order-2' : 'md:order-1'
          }`}>
            <SectionImage section={section} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className={`flex flex-col justify-center max-md:p-8 md:p-14 ${
            imageOnRight ? 'md:order-1' : 'md:order-2'
          }`}>
            <TextContent section={section} />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Layout: Stacked (image top, text card overlapping below) ---
function StackedLayout({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto flex max-w-[900px] flex-col items-center px-6">
        <div className="relative w-full overflow-hidden rounded-2xl md:aspect-video md:shadow-[24px_24px_48px_rgba(27,67,50,0.1)]">
          <div className="relative aspect-video">
            <SectionImage section={section} sizes="(max-width: 768px) 100vw, 900px" />
          </div>
        </div>
        <div className="relative z-[2] w-[90%] -mt-8 rounded-2xl bg-card p-8 text-center md:-mt-12 md:w-[80%] md:p-12">
          <TextContent section={section} />
        </div>
      </div>
    </section>
  )
}

// --- Layout: Hero overlay (full-width image with floating text card) ---
function HeroOverlayLayout({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'
  return (
    <section className="bg-cream">
      <div className="relative min-h-[500px] md:min-h-[600px]">
        <div className="absolute inset-0 overflow-hidden md:m-4 md:rounded-2xl">
          <div className="relative h-full w-full">
            <SectionImage section={section} sizes="100vw" />
          </div>
          <div className={`absolute inset-0 ${
            imageOnRight
              ? 'bg-gradient-to-l from-[rgba(27,67,50,0.55)] via-[rgba(27,67,50,0.15)] to-transparent'
              : 'bg-gradient-to-r from-[rgba(27,67,50,0.55)] via-[rgba(27,67,50,0.15)] to-transparent'
          }`} />
        </div>
        <div className={`relative z-[2] flex min-h-[500px] items-center justify-center px-6 py-20 md:min-h-[600px] md:px-12 ${
          imageOnRight ? 'md:justify-start' : 'md:justify-end'
        }`}>
          <div className="max-w-[480px] rounded-2xl bg-white/95 p-8 shadow-lg backdrop-blur-sm md:p-10">
            <TextContent section={section} />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Layout: Offset (vertically staggered) ---
function OffsetLayout({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className={`items-start gap-8 md:grid ${
          imageOnRight ? 'md:grid-cols-[1fr_1.15fr]' : 'md:grid-cols-[1.15fr_1fr]'
        }`}>
          <div className={`relative overflow-hidden rounded-2xl max-md:aspect-video md:mt-12 md:aspect-[4/5] md:shadow-[24px_24px_48px_rgba(27,67,50,0.1)] ${
            imageOnRight ? 'md:order-2' : 'md:order-1'
          }`}>
            <SectionImage section={section} />
          </div>
          <div className={`rounded-2xl bg-card max-md:p-8 md:p-12 ${
            imageOnRight ? 'md:order-1' : 'md:order-2'
          }`}>
            <TextContent section={section} />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Main component ---
export function TextImageSection({ section }: { section: PageSection }) {
  const variant = section.layoutVariant || 'overlap'

  switch (variant) {
    case 'split':
      return <SplitLayout section={section} />
    case 'contained':
      return <ContainedLayout section={section} />
    case 'stacked':
      return <StackedLayout section={section} />
    case 'hero-overlay':
      return <HeroOverlayLayout section={section} />
    case 'offset':
      return <OffsetLayout section={section} />
    default:
      return <OverlapLayout section={section} />
  }
}
