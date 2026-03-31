import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Leaf, Heart, Users } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'

export const metadata: Metadata = {
  title: 'Om oss — Roots & Culture',
  description:
    'Roots & Culture er forankret i norsk natur og kulturarv. Lær om vår historie, våre verdier og menneskene bak.',
  openGraph: {
    title: 'Om oss — Roots & Culture',
    description:
      'Roots & Culture er forankret i norsk natur og kulturarv. Lær om vår historie, våre verdier og menneskene bak.',
  },
}

const values = [
  {
    icon: Leaf,
    title: 'Natur',
    text: 'Vi tror på kraften i norsk natur. Alle våre produkter og opplevelser er skapt med dyp respekt for naturen, og vi jobber for å bevare de unike landskapene vi er så heldige å kalle hjem.',
  },
  {
    icon: Heart,
    title: 'Autentisitet',
    text: 'Alt vi tilbyr er ekte og gjennomtenkt. Fra håndplukkede urter til nøye kuraterte opplevelser — vi kompromisser aldri på kvalitet eller genuinitet. Det du får fra oss, er alltid det ekte.',
  },
  {
    icon: Users,
    title: 'Fellesskap',
    text: 'Vi bygger et fellesskap av naturelskere som deler en lidenskap for norsk natur og kulturarv. Sammen skaper vi opplevelser som knytter mennesker nærmere hverandre og naturen rundt oss.',
  },
]

const galleryImages = [
  { src: '/bilder-brukt-paa-sidene/om-oss/retreat-03-desktop.webp', alt: 'Retreat i norsk natur' },
  { src: '/bilder-brukt-paa-sidene/om-oss/retreat-08-desktop.webp', alt: 'Fellesskap rundt bålet' },
  { src: '/bilder-brukt-paa-sidene/om-oss/retreat-12-desktop.webp', alt: 'Naturopplevelse i skogen' },
  { src: '/bilder-brukt-paa-sidene/om-oss/retreat-15-desktop.webp', alt: 'Stille morgenstund i naturen' },
  { src: '/bilder-brukt-paa-sidene/om-oss/retreat-20-desktop.webp', alt: 'Vandring i fjellandskapet' },
  { src: '/bilder-brukt-paa-sidene/om-oss/catering-05-desktop.webp', alt: 'Mat laget med lokale råvarer' },
]

export default function OmOssPage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[50vh] items-center justify-center">
        <Image
          src="/bilder-brukt-paa-sidene/om-oss/hero-section-desktop.webp"
          alt="Roots & Culture — norsk natur og kulturarv"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-20 text-center md:px-8">
          <h1 className="font-heading text-[32px] font-bold leading-tight text-cream md:text-[42px]">
            Om Roots &amp; Culture
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-cream/90">
            Forankret i norsk natur og kulturarv
          </p>
        </div>
      </section>

      {/* ── Vår Historie ── */}
      <section className="bg-cream section-padding">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 md:grid-cols-2 md:items-center md:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/bilder-brukt-paa-sidene/om-oss/retreat-07-desktop.webp"
              alt="Naturopplevelse — Roots & Culture sin historie"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <SectionHeading title="Vår historie" />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-body">
              <p>
                Roots &amp; Culture ble født ut av en enkel overbevisning: at
                forbindelsen mellom mennesker og norsk natur er noe av det mest
                verdifulle vi har. Det startet med en drøm om å dele de stille
                øyeblikkene i skogen, smaken av ville urter plukket fra fjellsiden,
                og varmen fra et bål under åpen himmel.
              </p>
              <p>
                Vi tror at ekte velvære kommer fra å være til stede i naturen — ikke
                som tilskuere, men som deltagere. Gjennom nøye kuraterte produkter
                og unike opplevelser ønsker vi å gjøre norsk natur tilgjengelig for
                alle, uansett erfaring eller bakgrunn.
              </p>
              <p>
                Vår misjon er å bygge bro mellom gammel visdom og moderne liv. Vi
                samarbeider med lokale produsenter, erfarne guider og lidenskapelige
                håndverkere som deler vår respekt for naturen og norske tradisjoner.
                Sammen skaper vi opplevelser og produkter som berører, inspirerer og
                minner oss om hvor vi kommer fra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="bg-card section-padding">
        <div className="mx-auto max-w-[1200px] px-4 text-center md:px-8">
          <SectionHeading title="Menneskene bak" centered />
          <div className="mx-auto mt-12 max-w-sm">
            <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-xl">
              <Image
                src="/bilder-brukt-paa-sidene/om-oss/jacob-desktop.webp"
                alt="Jacob — grunnlegger av Roots & Culture"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
            <h3 className="mt-6 font-heading text-[22px] font-bold text-forest">
              Jacob
            </h3>
            <p className="mt-1 text-[15px] font-medium text-ember">Grunnlegger</p>
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              Med en dyp lidenskap for norsk natur og kulturarv startet Jacob
              Roots &amp; Culture for å dele de opplevelsene som har formet ham.
              Han tror at naturen har en unik evne til å samle mennesker, og at
              de beste øyeblikkene oppstår når vi tar oss tid til å være til
              stede — i skogen, ved fjorden eller rundt et bål.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <SectionHeading title="Våre verdier" centered />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl bg-card p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                  <value.icon
                    className="h-7 w-7 text-ember"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 font-heading text-[20px] font-bold text-forest">
                  {value.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-body">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image Gallery ── */}
      <section className="bg-card section-padding">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {galleryImages.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-[1200px] px-4 text-center md:px-8">
          <h2 className="font-heading text-[28px] font-bold text-forest">
            Klar for en opplevelse?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-body">
            Utforsk våre unike naturopplevelser og finn din neste eventyr.
          </p>
          <Link
            href="/opplevelser"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-forest px-6 py-2 font-body text-[15px] font-medium text-cream motion-safe:transition-all motion-safe:duration-100 hover:opacity-85 active:scale-[0.98]"
          >
            Se opplevelser
          </Link>
        </div>
      </section>
    </>
  )
}
