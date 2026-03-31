import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Personvernerklæring — Roots & Culture',
  description: 'Les om hvordan Roots & Culture behandler dine personopplysninger.',
}

export default function PersonvernPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-24 md:px-8">
      <Breadcrumbs items={[{ label: 'Personvern' }]} />
      <h1 className="mt-4 font-heading text-h1 font-bold text-forest">Personvernerklæring</h1>
      <p className="mt-2 text-label text-body">Sist oppdatert: mars 2026</p>

      <div className="mt-8 space-y-8 text-body leading-relaxed text-body">
        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">1. Behandlingsansvarlig</h2>
          <p className="mt-3">Roots & Culture er behandlingsansvarlig for personopplysninger som samles inn gjennom denne nettsiden. Kontakt oss på post@rootsculture.no for spørsmål om personvern.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">2. Hvilke opplysninger vi samler inn</h2>
          <p className="mt-3">Vi samler inn følgende opplysninger når du handler hos oss eller oppretter en konto:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Navn og e-postadresse</li>
            <li>Leveringsadresse</li>
            <li>Ordrehistorikk og bookinger</li>
            <li>Betalingsinformasjon (behandles av Stripe — vi lagrer ikke kortdetaljer)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">3. Formål med behandlingen</h2>
          <p className="mt-3">Vi bruker opplysningene til å:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Behandle og sende bestillinger</li>
            <li>Bekrefte og administrere bookinger</li>
            <li>Sende ordrebekreftelse og relevant informasjon</li>
            <li>Forbedre nettsidens funksjonalitet</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">4. Deling av opplysninger</h2>
          <p className="mt-3">Vi deler opplysninger med følgende tredjeparter kun for å utføre tjenestene:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Stripe (betalingsbehandling)</li>
            <li>Resend (e-postutsending)</li>
            <li>Firebase/Google Cloud (datalagring)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">5. Dine rettigheter</h2>
          <p className="mt-3">Du har rett til innsyn, retting, sletting og dataportabilitet. Kontakt oss på post@rootsculture.no for å utøve dine rettigheter.</p>
        </section>

        <section>
          <h2 className="font-heading text-h4 font-bold text-forest">6. Informasjonskapsler</h2>
          <p className="mt-3">Vi bruker nødvendige informasjonskapsler for sesjonshåndtering og handlekurv. Vi bruker ikke sporingskapsler eller tredjeparts analyseverktøy uten ditt samtykke.</p>
        </section>
      </div>
    </div>
  )
}
