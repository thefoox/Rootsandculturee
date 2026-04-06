import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { config } from 'dotenv'

config({ path: '.env.local' })

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore(app)
const now = Timestamp.now()

const experiences = [
  {
    id: 'exp-tidlig-var',
    slug: 'tidlig-var-retreat',
    name: 'Tidlig V\u00e5r \u2013 retreat med ville vekster',
    description: 'Oppdagelse, forberedelse og naturkontakt i v\u00e5rens f\u00f8rste fase. Dette to-dagers retreatet inviterer deg til \u00e5 m\u00f8te naturen i overgangen mellom vinter og v\u00e5r. En tid for spirende liv, oppv\u00e5kning og forberedelse. Sammen utforsker vi ville vekster i deres tidlige utviklingsfase og l\u00e6rer \u00e5 gjenkjenne dem f\u00f8r de st\u00e5r i full kraft. Du f\u00e5r innsikt i hvordan tidlig v\u00e5r har v\u00e6rt brukt tradisjonelt som en tid for rensing, styrking og forberedelse av kropp og sinn, og hvordan vi kan bruke unge skudd, r\u00f8tter og knopper som b\u00e5de mat og medisin.',
    category: 'retreat',
    images: [{ url: '/bilder-brukt-paa-sidene/opplevelser-retreat/tidlig-var-desktop.webp', alt: 'Tidlig v\u00e5r retreat med ville vekster p\u00e5 Holtan G\u00e5rd' }],
    basePrice: 395000,
    location: 'Holtan G\u00e5rd, Sande i Vestfold',
    durationText: '2 dager',
    difficulty: 'lett',
    whatIsIncluded: [
      'Guidet urtevandring med oppdagelse og identifisering av ville vekster (ca. 20\u201330 arter)',
      'Undervisning i plantenes virkestoffer, tradisjonell bruk og v\u00e5rens tema',
      'Smaking og enkel tilberedning av ville vekster som mat og drikke',
      'Plantebasert middag, frokost og lunsj med lokale gr\u00f8nnsaker og ville vekster',
      'Alkoholfri villgj\u00e6ret drikk til maten',
      'B\u00e5lkos, varme drikker og sosialt samv\u00e6r i naturen',
    ],
    cancellationPolicy: 'P\u00e5melding er bindende.',
    whatToBring: 'Kl\u00e6r og skot\u00f8y etter v\u00e6rforhold, skrivesaker og notatblokk, egen vannflaske og kopp.',
    dates: [{ id: 'ed-tv-1', date: new Date('2026-04-25T12:00:00'), maxSeats: 12, earlyBirdPrice: 325000, earlyBirdDeadline: new Date('2026-04-11') }],
  },
  {
    id: 'exp-forsommer',
    slug: 'forsommer-retreat',
    name: 'Forsommer \u2013 retreat med ville vekster',
    description: 'Overflod, n\u00e6ring og livskraft i naturens frodigste fase. Dette to-dagers retreatet inviterer deg inn i den tidlige sommerens gr\u00f8nne overflod. Naturen eksploderer i vekst, kraft og liv. Ville vekster st\u00e5r n\u00e5 i sin mest saftige og n\u00e6ringstette fase, og landskapet byr p\u00e5 et mangfold av spiselige planter som har v\u00e6rt brukt som mat og styrke gjennom generasjoner.',
    category: 'retreat',
    images: [{ url: '/bilder-brukt-paa-sidene/opplevelser-retreat/forsommer-desktop.webp', alt: 'Forsommer retreat med ville vekster p\u00e5 Holtan G\u00e5rd' }],
    basePrice: 395000,
    location: 'Holtan G\u00e5rd, Sande i Vestfold',
    durationText: '2 dager',
    difficulty: 'lett',
    whatIsIncluded: [
      'Guidet urtevandring med fokus p\u00e5 spiselige ville vekster (ca. 30\u201340 arter)',
      'Undervisning i plantenes ern\u00e6ringsmessige verdi, livskraft og tradisjonell bruk',
      'Praktisk tilberedning av ville vekster \u2013 enkle m\u00e5ltider, smakspr\u00f8ver og gr\u00f8nne retter',
      'Plantebasert middag, frokost og lunsj med lokale gr\u00f8nnsaker og ville vekster',
      'Alkoholfri villgj\u00e6ret drikk til maten',
      'B\u00e5lkos, felles m\u00e5ltider og sosialt samv\u00e6r i naturen',
    ],
    cancellationPolicy: 'P\u00e5melding er bindende.',
    whatToBring: 'Kl\u00e6r og skot\u00f8y etter v\u00e6rforhold, skrivesaker og notatblokk, egen vannflaske og kopp.',
    dates: [{ id: 'ed-fs-1', date: new Date('2026-05-30T12:00:00'), maxSeats: 12, earlyBirdPrice: 325000, earlyBirdDeadline: new Date('2026-05-16') }],
  },
  {
    id: 'exp-midtsommer',
    slug: 'midtsommer-retreat',
    name: 'Midtsommer \u2013 retreat med ville vekster',
    description: 'Blomstring, modning og oppdagelsen av naturens fulle uttrykk. Dette to-dagers retreatet inviterer deg inn i midtsommerens rike landskap. Naturen st\u00e5r i full utfoldelse. Plantene har n\u00e5 n\u00e5dd sin modningsfase, blomster \u00e5pner seg i sol og varme, og landskapet b\u00e6rer preg av overflod, farge og duft.',
    category: 'retreat',
    images: [{ url: '/bilder-brukt-paa-sidene/opplevelser-retreat/midtsommer-desktop.webp', alt: 'Midtsommer retreat med ville vekster p\u00e5 Holtan G\u00e5rd' }],
    basePrice: 395000,
    location: 'Holtan G\u00e5rd, Sande i Vestfold',
    durationText: '2 dager',
    difficulty: 'lett',
    whatIsIncluded: [
      'Guidet urtevandring med fokus p\u00e5 blomstrende og modne ville vekster (ca. 30\u201340 arter)',
      'Undervisning i plantenes modningsfase, virkestoffer og tradisjonell bruk',
      'Arbeid med blomster og urter \u2013 smaking, enkle tilberedninger og sanselige opplevelser',
      'Plantebasert middag, frokost og lunsj med lokale gr\u00f8nnsaker og ville vekster',
      'Alkoholfri villgj\u00e6ret drikk til maten',
      'B\u00e5lkos, lette sommerm\u00e5ltider og sosialt samv\u00e6r i naturen',
    ],
    cancellationPolicy: 'P\u00e5melding er bindende.',
    whatToBring: 'Kl\u00e6r og skot\u00f8y etter v\u00e6rforhold, skrivesaker og notatblokk, egen vannflaske og kopp.',
    dates: [{ id: 'ed-ms-1', date: new Date('2026-06-27T12:00:00'), maxSeats: 12, earlyBirdPrice: 325000, earlyBirdDeadline: new Date('2026-06-13') }],
  },
  {
    id: 'exp-sommer',
    slug: 'sommer-retreat',
    name: 'Sommer \u2013 retreat med ville vekster',
    description: 'Overflod, n\u00e6ring og livskraft i naturens frodigste fase. Dette to-dagers retreatet inviterer deg inn i sommerens modne landskap. Vekstene har f\u00e5tt st\u00e5 lenge i sol og varme, og naturen viser seg i all sin fylde. Plantene er kraftige, blomstrene tallrike, og mange arter b\u00e6rer n\u00e5 b\u00e5de smak, aroma og virkestoffer p\u00e5 sitt mest utviklede niv\u00e5.',
    category: 'retreat',
    images: [{ url: '/bilder-brukt-paa-sidene/opplevelser-retreat/sommer-desktop.webp', alt: 'Sommer retreat med ville vekster p\u00e5 Holtan G\u00e5rd' }],
    basePrice: 395000,
    location: 'Holtan G\u00e5rd, Sande i Vestfold',
    durationText: '2 dager',
    difficulty: 'lett',
    whatIsIncluded: [
      'Guidet urtevandring med fokus p\u00e5 modne og blomstrende ville vekster (ca. 30\u201340 arter)',
      'Undervisning i plantenes modningsprosess, konsentrasjon av virkestoffer og bruk',
      'Arbeid med blomster og urter \u2013 smaking, enkle tilberedninger og uttrekk',
      'Plantebasert middag, frokost og lunsj med lokale gr\u00f8nnsaker og ville vekster',
      'Alkoholfri villgj\u00e6ret drikk til maten',
      'B\u00e5lkos, lette sommerm\u00e5ltider og sosialt samv\u00e6r i naturen',
    ],
    cancellationPolicy: 'P\u00e5melding er bindende.',
    whatToBring: 'Kl\u00e6r og skot\u00f8y etter v\u00e6rforhold, skrivesaker og notatblokk, egen vannflaske og kopp.',
    dates: [{ id: 'ed-so-1', date: new Date('2026-07-25T12:00:00'), maxSeats: 12, earlyBirdPrice: 325000, earlyBirdDeadline: new Date('2026-07-11') }],
  },
]

async function seed() {
  console.log('Seeding Firestore...\n')

  // Delete existing products
  const productsSnap = await db.collection('products').get()
  for (const doc of productsSnap.docs) {
    await doc.ref.delete()
    console.log(`  Deleted product: ${doc.id}`)
  }

  // Delete existing experiences and their dates subcollections
  const expSnap = await db.collection('experiences').get()
  for (const doc of expSnap.docs) {
    const datesSnap = await doc.ref.collection('dates').get()
    for (const dateDoc of datesSnap.docs) {
      await dateDoc.ref.delete()
    }
    await doc.ref.delete()
    console.log(`  Deleted experience: ${doc.id}`)
  }

  console.log('\nOld data cleared. Adding new experiences...\n')

  for (const exp of experiences) {
    const { dates, id, ...expData } = exp
    await db.collection('experiences').doc(id).set({
      ...expData,
      createdAt: Timestamp.fromDate(new Date('2026-03-01')),
      updatedAt: now,
      publishedAt: Timestamp.fromDate(new Date('2026-03-01')),
    })
    console.log(`  Added experience: ${exp.name}`)

    for (const date of dates) {
      const { id: dateId, ...dateData } = date
      await db.collection('experiences').doc(id).collection('dates').doc(dateId).set({
        ...dateData,
        date: Timestamp.fromDate(dateData.date),
        earlyBirdDeadline: dateData.earlyBirdDeadline ? Timestamp.fromDate(dateData.earlyBirdDeadline) : null,
        bookedSeats: 0,
        availableSeats: dateData.maxSeats,
        isActive: true,
        priceOverride: null,
      })
      console.log(`    Added date: ${dateData.date.toISOString().split('T')[0]}`)
    }
  }

  console.log('\nDone! Firestore seeded with 4 real retreats.')
}

seed().catch(console.error)
