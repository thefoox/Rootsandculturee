import type { PageSection } from '@/types'

export function NewsletterSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-forest py-20 text-center">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <h2 className="font-heading text-h2 font-bold tracking-tight text-cream">
            {section.heading}
          </h2>
        )}
        {section.subheading && (
          <p className="mt-2 text-body text-cream/65">
            {section.subheading}
          </p>
        )}
        <form
          className="mx-auto mt-7 flex max-w-[480px] gap-3 rounded-xl border border-cream/10 bg-cream/8 p-1.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Din e-postadresse"
            className="flex-1 bg-transparent px-4 py-3.5 font-body text-body text-cream outline-none placeholder:text-cream/35"
            aria-label="E-postadresse for nyhetsbrev"
            required
          />
          <button
            type="submit"
            disabled
            className="whitespace-nowrap rounded-lg bg-cream px-6 py-3.5 text-label font-bold text-forest motion-safe:transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            title="Kommer snart"
          >
            {section.ctaText || 'Meld meg pa'}
          </button>
        </form>
        <p className="mt-3 text-[0.75rem] text-cream/35">
          Vi sender maks 2 e-poster i maneden. Ingen spam.
        </p>
      </div>
    </section>
  )
}
