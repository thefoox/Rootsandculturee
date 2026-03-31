import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail, MapPin, Clock, AtSign } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
  openGraph: {
    title: 'Kontakt oss — Roots & Culture',
    description:
      'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
  },
}

const contactInfo = [
  {
    icon: Mail,
    label: 'E-post',
    value: 'post@rootsculture.no',
    href: 'mailto:post@rootsculture.no',
  },
  {
    icon: AtSign,
    label: 'Instagram',
    value: '@rootsculture',
    href: 'https://instagram.com/rootsculture',
  },
  {
    icon: MapPin,
    label: 'Adresse',
    value: 'Oslo, Norge',
    href: null,
  },
  {
    icon: Clock,
    label: 'Svartid',
    value: 'Vi svarer innen 24 timer',
    href: null,
  },
]

const faqItems = [
  {
    question: 'Hvordan bestiller jeg produkter?',
    answer:
      'Du kan bestille produkter direkte i nettbutikken vår. Legg varene i handlekurven, gå til kassen og fullfør betalingen med Stripe. Du mottar en ordrebekreftelse på e-post så snart bestillingen er registrert.',
  },
  {
    question: 'Kan jeg kansellere en booking?',
    answer:
      'Ja, du kan kansellere en booking ved å kontakte oss på post@rootsculture.no. Kanselleringsvilkårene varierer fra opplevelse til opplevelse — sjekk detaljsiden for den aktuelle opplevelsen for spesifikke vilkår.',
  },
  {
    question: 'Hvordan fungerer frakt?',
    answer:
      'Vi tilbyr frakt til hele Norge med flat fraktpris. Bestillinger sendes normalt innen 1–3 virkedager, og du mottar sporingsinformasjon på e-post når pakken er sendt.',
  },
  {
    question: 'Hva gjør jeg hvis jeg har allergi?',
    answer:
      'Dersom du har allergier eller spesielle behov, ber vi deg ta kontakt med oss før du bestiller. Vi tilpasser gjerne matopplevelser og produkter etter dine behov så langt det er mulig.',
  },
  {
    question: 'Tilbyr dere gavekort?',
    answer:
      'Vi jobber med å lansere gavekort i nettbutikken. Foreløpig kan du kontakte oss på e-post for å arrangere en gaveopplevelse — vi hjelper deg gjerne med å finne den perfekte gaven.',
  },
]

export default function KontaktPage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[40vh] items-center justify-center">
        <Image
          src="/bilder-brukt-paa-sidene/kontakt/retreat-20-desktop.webp"
          alt="Kontakt Roots & Culture"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-20 text-center md:px-8">
          <h1 className="font-heading text-[32px] font-bold leading-tight text-cream md:text-[42px]">
            Kontakt oss
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-cream/90">
            Vi hører gjerne fra deg
          </p>
        </div>
      </section>

      {/* ── Contact Info + Form ── */}
      <section className="bg-cream section-padding">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 md:grid-cols-2 md:px-8">
          {/* Left: Contact information */}
          <div>
            <SectionHeading title="Kontaktinformasjon" />
            <div className="mt-8 space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                    <item.icon
                      className="h-5 w-5 text-ember"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium tracking-wide text-forest">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-[15px] text-body underline-offset-2 motion-safe:transition-colors motion-safe:duration-100 hover:text-forest hover:underline"
                        {...(item.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[15px] text-body">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Optional image */}
            <div className="relative mt-10 hidden aspect-[16/9] overflow-hidden rounded-xl md:block">
              <Image
                src="/bilder-brukt-paa-sidene/kontakt/retreat-18-desktop.webp"
                alt="Naturopplevelse med Roots & Culture"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <SectionHeading title="Send oss en melding" />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="bg-card section-padding">
        <div className="mx-auto max-w-[800px] px-4 md:px-8">
          <SectionHeading
            title="Vanlige spørsmål"
            centered
          />
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl bg-cream"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[15px] font-medium text-forest marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    className="ml-4 shrink-0 text-body motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-[15px] leading-relaxed text-body">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
