import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Vilkår og betingelser — Roots & Culture',
  description: 'Les vilkårene for kjøp og booking hos Roots & Culture.',
}

export default function VilkarPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-24 md:px-8">
      <Breadcrumbs items={[{ label: 'Vilkår' }]} />
      <h1 className="mt-4 font-heading text-h1 font-bold text-forest">Vilkår og betingelser</h1>
      <p className="mt-2 text-label text-body">Sist oppdatert: mars 2026</p>

      <div className="mt-8 space-y-8 text-body leading-relaxed text-body">
        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">1. Generelt</h2>
          <p className="mt-3">Disse vilkårene gjelder for alle kjøp og bookinger gjennom rootsculture.no. Ved å handle hos oss godtar du disse vilkårene.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">2. Bestilling og betaling</h2>
          <p className="mt-3">Alle priser er oppgitt i norske kroner (NOK) inkludert merverdiavgift. Betaling skjer via Stripe med kort. En bindende avtale inngås når du fullfører betalingen.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">3. Frakt</h2>
          <p className="mt-3">Vi sender fysiske produkter med flat fraktpris til hele Norge. Leveringstid er normalt 3–7 virkedager. Du mottar sporingsinformasjon på e-post.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">4. Angrerett</h2>
          <p className="mt-3">I henhold til angrerettloven har du 14 dagers angrerett på fysiske produkter fra mottak. Varen må returneres i uåpnet og uskadet tilstand. Kontakt oss på post@rootsculture.no for å benytte angreretten.</p>
          <p className="mt-2">Angrerett gjelder ikke for opplevelser/bookinger som er gjennomført eller har passert kanselleringsfristen.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">5. Booking og kansellering</h2>
          <p className="mt-3">Kanselleringsvilkår varierer per opplevelse og er oppgitt på opplevelsens detaljside. Generelt tilbyr vi gratis kansellering inntil 7–21 dager før opplevelsen. Kontakt oss for kansellering.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">6. Reklamasjon</h2>
          <p className="mt-3">Du har reklamasjonsrett i henhold til forbrukerkjøpsloven. Kontakt oss innen rimelig tid etter at du oppdaget mangelen.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">7. Kontakt</h2>
          <p className="mt-3">Roots & Culture<br />Oslo, Norge<br />E-post: post@rootsculture.no</p>
        </section>
      </div>
    </div>
  )
}
