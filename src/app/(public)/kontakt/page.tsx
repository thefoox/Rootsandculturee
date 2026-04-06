import type { Metadata } from 'next'
import { DynamicPage } from '@/components/sections/DynamicPage'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
}

export default function KontaktPage() {
  return (
    <>
      <DynamicPage pageId="kontakt" />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-[600px] px-4 md:px-8">
          <h2 className="font-heading text-h2 font-bold text-forest">
            Send oss en melding
          </h2>
          <p className="mt-2 font-body text-body">
            Fyll ut skjemaet så svarer vi deg så snart vi kan.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
