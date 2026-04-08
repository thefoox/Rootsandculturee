import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, Globe, ExternalLink } from 'lucide-react'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
  openGraph: {
    title: 'Kontakt oss — Roots & Culture',
    description: 'Ta kontakt med oss. Vi hører gjerne fra deg.',
  },
}

const FAQ = [
  { q: 'Hvor lang tid tar det før dere svarer?', a: 'Vi svarer vanligvis innen 24 timer på hverdager.' },
  { q: 'Tilbyr dere bedriftsarrangementer?', a: 'Ja! Vi skreddersyr opplevelser for bedrifter.' },
  { q: 'Kan jeg kansellere en booking?', a: 'Kanselleringsvilkårene varierer per opplevelse. Sjekk detaljsiden.' },
  { q: 'Kan jeg gi en opplevelse i gave?', a: 'Absolutt! Kjøp gavekort på valgfri verdi i nettbutikken.' },
  { q: 'Hvor finner jeg dere?', a: 'Holtan Gård i Sande, Vestfold. Ca. 1,5 timer fra Oslo.' },
  { q: 'Har dere parkering?', a: 'Ja, gratis parkering på gården. Veibeskrivelse sendes med bookingbekreftelsen.' },
]

export default function KontaktPage() {
  return (
    <>
      {/* ═══ HERO: Compact forest ═══ */}
      <section className="bg-forest pb-20 pt-40 md:pt-44">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="max-w-[640px]">
            <h1 className="font-heading text-h1 font-bold leading-tight text-cream">
              Ta kontakt
            </h1>
            <p className="mt-3 font-heading text-lg font-light leading-relaxed text-cream/75">
              Har du spørsmål om opplevelser, produkter eller samarbeid? Vi svarer gjerne.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT METHOD CARDS: Floating overlap ═══ */}
      <section className="relative z-10 -mt-12">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                icon: Mail,
                title: 'E-post',
                sub: 'Svar innen 24 timer',
                value: 'post@rootsculture.no',
                href: 'mailto:post@rootsculture.no',
              },
              {
                icon: Phone,
                title: 'Telefon',
                sub: 'Man–Fre 09:00–17:00',
                value: '+47 123 45 678',
                href: 'tel:+4712345678',
              },
              {
                icon: MapPin,
                title: 'Besøk oss',
                sub: 'Etter avtale',
                value: 'Holtan Gård, Sande',
                href: null,
              },
            ].map(({ icon: Icon, title, sub, value, href }) => (
              <div
                key={title}
                className="rounded-2xl border border-forest/4 bg-white p-8 text-center shadow-[0_4px_24px_rgba(27,67,50,0.08)] motion-safe:transition-all motion-safe:duration-250 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(27,67,50,0.12)]"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-forest/6">
                  <Icon className="h-6 w-6 text-forest" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-h4 font-bold text-forest">{title}</h3>
                <p className="mt-1 text-label text-body/50">{sub}</p>
                {href ? (
                  <a
                    href={href}
                    className="mt-3 inline-block text-body font-semibold text-forest hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="mt-3 inline-block text-body font-semibold text-forest">
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FORM SECTION: Split layout ═══ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-start gap-16 md:grid-cols-[1.2fr_1fr]">
            {/* Left: Intro */}
            <div className="pt-4">
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                Send oss en melding
              </h2>
              <p className="mt-3 text-body leading-relaxed text-body/70">
                Fortell oss hva du lurer på, så svarer vi så raskt vi kan. Vi elsker å høre fra folk som deler vår lidenskap for norsk natur.
              </p>
              <div className="mt-6 rounded-xl bg-card p-5">
                <p className="text-label leading-relaxed">
                  <span className="font-semibold text-forest">Bedriftsarrangementer?</span>
                  <br />
                  Vi skreddersyr opplevelser for grupper og bedrifter. Fortell oss om ønskene deres i skjemaet, så lager vi et uforpliktende tilbud.
                </p>
              </div>

              {/* Social media */}
              <div className="mt-8">
                <h3 className="font-heading text-h4 font-bold text-forest">Sosiale medier</h3>
                <div className="mt-3 space-y-2">
                  <a href="#" className="flex items-center gap-3 text-body text-body/60 hover:text-forest">
                    <Globe className="h-5 w-5" aria-hidden="true" />
                    @rootsculture
                  </a>
                  <a href="#" className="flex items-center gap-3 text-body text-body/60 hover:text-forest">
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    Roots & Culture
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="rounded-2xl bg-card p-8 md:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ CARDS ═══ */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              Ofte stilte spørsmål
            </h2>
          </div>
          <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-4 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-forest/4 bg-cream p-6 motion-safe:transition-shadow hover:shadow-[0_4px_16px_rgba(27,67,50,0.06)]"
              >
                <h4 className="font-heading text-body font-bold leading-snug text-forest">{q}</h4>
                <p className="mt-2 text-label leading-relaxed text-body/65">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LOCATION ═══ */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_1.5fr]">
            <div>
              <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
                Finn oss
              </h2>
              <p className="mt-3 text-body leading-relaxed text-body/70">
                Vi holder til på Holtan Gård, omgitt av skog og en av Norges vakreste kystlinjer.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-[18px] w-[18px] flex-shrink-0 text-forest/50" aria-hidden="true" />
                  <span className="text-body">Holtan Gård, Sande i Vestfold</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-[18px] w-[18px] flex-shrink-0 text-forest/50" aria-hidden="true" />
                  <span className="text-body">Man–Fre 09–17, Lør 10–15</span>
                </div>
              </div>
            </div>
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-forest/6 bg-card text-label text-body/40">
              [Google Maps: Holtan Gård, Sande i Vestfold]
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
