// Seed mock page content into Firestore
// Run: npx tsx scripts/seed-pages.ts

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0]

const db = getFirestore(app)

const pages = [
  {
    id: 'om-oss',
    title: 'Om oss',
    slug: 'om-oss',
    isPublished: true,
    showInNavigation: true,
    navigationOrder: 30,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Om Roots & Culture', subheading: 'Forankret i norsk natur og kulturarv', image: { url: '/bilder-brukt-paa-sidene/om-oss/hero-section-desktop.webp', alt: 'Roots & Culture' }, order: 0 },
      { id: 'historie', type: 'text-image', heading: 'Vår historie', body: '<p>Roots & Culture ble startet med en enkel idé: å gjøre det lettere for folk å oppleve det beste av norsk natur og kulturarv.</p><p>Fra starten har vi samarbeidet med lokale produsenter, bønder og naturguider som deler vår lidenskap.</p><p>Enten du søker ro i skogen, vil lære om ville urter, eller drømmer om mat laget over bål — vi har noe for deg.</p>', image: { url: '/bilder-brukt-paa-sidene/om-oss/retreat-07-desktop.webp', alt: 'Vandring i norsk natur' }, order: 1 },
      { id: 'team', type: 'team', heading: 'Menneskene bak', items: [{ title: 'Jacob', description: 'Grunnlegger av Roots & Culture.', image: { url: '/bilder-brukt-paa-sidene/om-oss/jacob-desktop.webp', alt: 'Jacob, grunnlegger' } }], order: 2 },
      { id: 'verdier', type: 'values', heading: 'Våre verdier', items: [{ title: 'Natur', description: 'Vi tror på kraften i norsk natur.', icon: 'leaf' }, { title: 'Autentisitet', description: 'Alt vi tilbyr er ekte og gjennomtenkt.', icon: 'heart' }, { title: 'Fellesskap', description: 'Vi bygger et fellesskap av naturelskere.', icon: 'users' }], order: 3 },
      { id: 'galleri', type: 'gallery', heading: 'Bilder fra våre opplevelser', items: [{ title: '', description: '', image: { url: '/bilder-brukt-paa-sidene/om-oss/retreat-03-desktop.webp', alt: 'Retreat i naturen' } }, { title: '', description: '', image: { url: '/bilder-brukt-paa-sidene/om-oss/catering-05-desktop.webp', alt: 'Matlaging utendørs' } }, { title: '', description: '', image: { url: '/bilder-brukt-paa-sidene/om-oss/retreat-15-desktop.webp', alt: 'Vandring i fjellet' } }], order: 4 },
      { id: 'cta', type: 'cta', heading: 'Klar for en opplevelse?', subheading: 'Utforsk våre unike naturopplevelser.', ctaText: 'Se opplevelser', ctaLink: '/opplevelser', order: 5 },
    ],
  },
  {
    id: 'kontakt',
    title: 'Kontakt',
    slug: 'kontakt',
    isPublished: true,
    showInNavigation: true,
    navigationOrder: 40,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Kontakt oss', subheading: 'Vi hører gjerne fra deg', image: { url: '/bilder-brukt-paa-sidene/kontakt/retreat-20-desktop.webp', alt: 'Kontakt Roots & Culture' }, order: 0 },
      { id: 'kontakt-info', type: 'contact-info', heading: 'Kontaktinformasjon', items: [{ title: 'E-post', description: 'post@rootsculture.no', icon: 'mail' }, { title: 'Instagram', description: '@rootsculture', icon: 'at-sign' }, { title: 'Adresse', description: 'Oslo, Norge', icon: 'map-pin' }, { title: 'Svartid', description: 'Vi svarer innen 24 timer', icon: 'clock' }], image: { url: '/bilder-brukt-paa-sidene/kontakt/retreat-18-desktop.webp', alt: 'Natur' }, order: 1 },
      { id: 'faq', type: 'faq', heading: 'Vanlige spørsmål', items: [{ title: 'Hvordan bestiller jeg produkter?', description: 'Legg produktene i handlekurven og gå til kassen.' }, { title: 'Kan jeg kansellere en booking?', description: 'Ja. Kontakt oss på e-post.' }, { title: 'Hvordan fungerer frakt?', description: 'Vi sender med flat rate frakt til hele Norge.' }, { title: 'Hva gjør jeg hvis jeg har allergi?', description: 'Kontakt oss før du booker en matopplevelse.' }], order: 2 },
    ],
  },
  {
    id: 'opplevelser',
    title: 'Opplevelser',
    slug: 'opplevelser',
    isPublished: true,
    showInNavigation: true,
    navigationOrder: 10,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Opplevelser i norsk natur', subheading: 'Naturretreater, kurs og matopplevelser som bringer deg nærmere naturen', image: { url: '/bilder-brukt-paa-sidene/opplevelser-hovedside/retreat-20-desktop.webp', alt: 'Opplevelser i naturen' }, order: 0 },
      { id: 'intro', type: 'text-image', heading: 'Naturopplevelser som berører', body: '<p>Hos Roots & Culture handler opplevelser om mer enn bare aktiviteter. Det handler om å stoppe opp, puste dypt, og kjenne forbindelsen til naturen rundt deg.</p>', image: { url: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-21-desktop.webp', alt: 'Naturopplevelse' }, ctaText: 'Se tilgjengelige opplevelser', ctaLink: '#opplevelser', order: 1 },
      { id: 'faq', type: 'faq', heading: 'Vanlige spørsmål', items: [{ title: 'Hva inkluderer prisen?', description: 'Alt som er listet under «Hva er inkludert».' }, { title: 'Hvordan booker jeg?', description: 'Velg en opplevelse, velg en dato, og fullfør betalingen.' }, { title: 'Kan jeg kansellere?', description: 'Ja. Se kanselleringsvilkårene på detaljsiden.' }], order: 2 },
    ],
  },
  {
    id: 'retreat',
    title: 'Naturretreater',
    slug: 'retreat',
    isPublished: true,
    showInNavigation: false,
    navigationOrder: 0,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Naturretreater', subheading: 'Koble av fra hverdagen med guidede retreater i norsk natur.', image: { url: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-20-desktop.webp', alt: 'Naturretreat' }, order: 0 },
      { id: 'info', type: 'text-image', heading: 'Om våre retreater', body: '<p>Våre naturretreater gir deg muligheten til å koble helt av fra hverdagen. Med erfarne guider tar vi deg med inn i norsk natur.</p><p>Alle retreater inkluderer overnatting, måltider med lokale råvarer, og guidede aktiviteter tilpasset ditt nivå.</p>', image: { url: '/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-12-desktop.webp', alt: 'Retreat i naturen' }, order: 1 },
    ],
  },
  {
    id: 'kurs',
    title: 'Kurs',
    slug: 'kurs',
    isPublished: true,
    showInNavigation: false,
    navigationOrder: 0,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Kurs', subheading: 'Lær å sanke, lage mat og opplev norsk natur på nært hold.', image: { url: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-01-desktop.webp', alt: 'Kurs i naturen' }, order: 0 },
      { id: 'info', type: 'text-image', heading: 'Om våre kurs', body: '<p>Våre kurs gir deg praktisk kunnskap om norsk natur og tradisjoner. Kursene er tilpasset alle nivåer.</p>', image: { url: '/bilder-brukt-paa-sidene/opplevelser-kurs/kurs-05-desktop.webp', alt: 'Urtesamling' }, order: 1 },
    ],
  },
  {
    id: 'matopplevelse',
    title: 'Matopplevelser',
    slug: 'matopplevelse',
    isPublished: true,
    showInNavigation: false,
    navigationOrder: 0,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'hero', type: 'hero', heading: 'Matopplevelser', subheading: 'Smak på norske tradisjoner med matlagingskurs og lokale råvarer.', image: { url: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-06-desktop.webp', alt: 'Matopplevelse' }, order: 0 },
      { id: 'info', type: 'text-image', heading: 'Om våre matopplevelser', body: '<p>Våre matopplevelser tar deg med til tradisjonelle norske gårder der du lærer å lage klassiske retter med lokale råvarer.</p>', image: { url: '/bilder-brukt-paa-sidene/opplevelser-catering/catering-03-desktop.webp', alt: 'Matlaging' }, order: 1 },
    ],
  },
  {
    id: 'produkter',
    title: 'Produkter',
    slug: 'produkter',
    isPublished: true,
    showInNavigation: true,
    navigationOrder: 20,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'heading', type: 'text', heading: 'Produkter', subheading: 'Utforsk vårt håndplukkede utvalg av autentiske norske produkter.', order: 0 },
    ],
  },
  {
    id: 'blogg',
    title: 'Blogg',
    slug: 'blogg',
    isPublished: true,
    showInNavigation: true,
    navigationOrder: 25,
    updatedAt: new Date('2025-09-01'),
    sections: [
      { id: 'heading', type: 'text', heading: 'Blogg', subheading: 'Artikler om norsk natur, kultur og tradisjoner.', order: 0 },
    ],
  },
]

async function seed() {
  const batch = db.batch()

  for (const page of pages) {
    const { id, ...data } = page
    const ref = db.collection('pageContent').doc(id)
    batch.set(ref, data)
  }

  await batch.commit()
  console.log(`Seeded ${pages.length} pages into Firestore pageContent collection.`)
}

seed().catch(console.error)
