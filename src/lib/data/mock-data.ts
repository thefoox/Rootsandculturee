import type {
  Product,
  Experience,
  ExperienceDate,
  Article,
  SiteContent,
} from '@/types'

// ---------------------------------------------------------------------------
// Mock Products (prices in ore = NOK * 100)
// ---------------------------------------------------------------------------

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'skogsbaer-saft',
    name: 'Skogsbær-saft',
    description:
      'Handplukket norsk skogsbærsaft laget av blåbær, tyttebær og bringebær fra dype skoger i Trøndelag. Saftig og naturlig søt uten tilsetningsstoffer. Perfekt til festlige anledninger eller som en daglig vitaminboost.',
    price: 14900,
    category: 'drikke',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
    publishedAt: new Date('2025-09-01'),
  },
  {
    id: 'prod-2',
    slug: 'fjellurt-te',
    name: 'Fjellurt-te',
    description:
      'En aromatisk urteblanding håndplukket fra norske fjellsider over 800 meter. Inneholder reinrose, fjellflokk og karve som gir en mild og beroligende smak. Nytes best en kald kveld foran peisen.',
    price: 8900,
    category: 'kaffe-te',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-02'),
    updatedAt: new Date('2025-09-02'),
    publishedAt: new Date('2025-09-02'),
  },
  {
    id: 'prod-3',
    slug: 'villblomst-honning',
    name: 'Villblomst-honning',
    description:
      'Rå, ubehandlet honning fra ville blomsterenger i Hardanger. Biene henter nektar fra kløver, mjødurt og engblom gjennom hele sommersesongen. Smaker fantastisk på nybakt brød eller i te.',
    price: 19900,
    category: 'naturprodukter',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-03'),
    updatedAt: new Date('2025-09-03'),
    publishedAt: new Date('2025-09-03'),
  },
  {
    id: 'prod-4',
    slug: 'bjorkesaft',
    name: 'Bjørkesaft',
    description:
      'Fersk bjørkesaft tappet fra nordnorsk skog tidlig på våren. Naturlig mineralrik og lett søtlig i smaken. En gammel norsk tradisjon som gir kroppen viktige mineraler etter en lang vinter.',
    price: 12900,
    category: 'drikke',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-04'),
    updatedAt: new Date('2025-09-04'),
    publishedAt: new Date('2025-09-04'),
  },
  {
    id: 'prod-5',
    slug: 'roykkaffe-mork-brent',
    name: 'Røykkaffe \u2014 Mørk Brent',
    description:
      'Spesialkaffe saktebrent over bjørkeved i tradisjonell norsk stil. Gir en dyp, røykfylt aroma med hint av sjokolade og ville bær. Malt til filterkaffe for optimal smaksutvikling.',
    price: 17900,
    category: 'kaffe-te',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-05'),
    updatedAt: new Date('2025-09-05'),
    publishedAt: new Date('2025-09-05'),
  },
  {
    id: 'prod-6',
    slug: 'trollkrem-pulver',
    name: 'Trollkrem-pulver',
    description:
      'Frysetørket tyttebærpulver til tradisjonell trollkrem \u2014 den klassiske norske desserten. Bare tilsett eggehvite og sukker for en luftig, rosa drøm. Pakket i praktisk boks med oppskrift.',
    price: 6900,
    category: 'naturprodukter',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-06'),
    updatedAt: new Date('2025-09-06'),
    publishedAt: new Date('2025-09-06'),
  },
  {
    id: 'prod-7',
    slug: 'ramslokpesto',
    name: 'Ramsløkpesto',
    description:
      'Håndlaget pesto av vill ramsløk plukket i skogene rundt Oslofjorden om våren. Blandet med norske solsikkefrø, olivenolje og parmesan. Gir en unik, hvitløksaktig smak til pasta, brød og grillmat.',
    price: 11900,
    category: 'naturprodukter',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-07'),
    updatedAt: new Date('2025-09-07'),
    publishedAt: new Date('2025-09-07'),
  },
  {
    id: 'prod-8',
    slug: 'grankvist-sirup',
    name: 'Grankvist-sirup',
    description:
      'Sirup laget av ferske granskudd plukket om våren i Østmarka. De lyse, myke skuddene gir en frisk og aromatisk sirup med hint av sitrus og skog. Perfekt til pannekaker, yoghurt eller cocktails.',
    price: 9900,
    category: 'drikke',
    images: [],
    inStock: true,
    stockCount: 50,
    createdAt: new Date('2025-09-08'),
    updatedAt: new Date('2025-09-08'),
    publishedAt: new Date('2025-09-08'),
  },
]

// ---------------------------------------------------------------------------
// Mock Experiences (prices in ore)
// ---------------------------------------------------------------------------

export const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    slug: 'skogsbad-i-nordmarka',
    name: 'Skogsbad i Nordmarka',
    description:
      'En helg med skogsterapi og naturmeditasjon i hjertet av Nordmarka. Opplev den japansk-inspirerte tradisjonen shinrin-yoku tilpasset norsk natur, med guidede vandringer, pusteøvelser og stille refleksjon mellom hundre år gamle grantrær.',
    category: 'retreat',
    images: [],
    basePrice: 349900,
    location: 'Nordmarka, Oslo',
    durationText: '2 dager',
    difficulty: 'lett',
    whatIsIncluded: [
      'Overnatting i skogshytte',
      'Alle måltider med lokale råvarer',
      'Guidet skogsterapi',
      'Meditasjonsøkter',
      'Te-seremoni',
    ],
    cancellationPolicy: 'Gratis avbestilling inntil 14 dager før. 50% refusjon inntil 7 dager før.',
    whatToBring: 'Turklær, gode sko, yogamatte (kan lånes), vannflaske, åpent sinn.',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
    publishedAt: new Date('2025-10-01'),
  },
  {
    id: 'exp-2',
    slug: 'urtesamling-i-fjellet',
    name: 'Urtesamling i fjellet',
    description:
      'Lær å finne og bruke ville urter i det norske fjellandskapet. En erfaren botaniker guider deg gjennom fjellenger og bekkedaler der du lærer å identifisere, plukke og tilberede urter til mat og drikke.',
    category: 'kurs',
    images: [],
    basePrice: 149900,
    location: 'Jotunheimen',
    durationText: '1 dag',
    difficulty: 'moderat',
    whatIsIncluded: [
      'Guidet urtesamling',
      'Lunsj laget av sanket mat',
      'Urtebok og oppslagsverk',
      'Tørkede urteprøver å ta med hjem',
    ],
    cancellationPolicy: 'Gratis avbestilling inntil 7 dager før. Ingen refusjon etter det.',
    whatToBring: 'Fjellsko, regnklær, matpakke til formiddagen, kurv eller pose til urter.',
    createdAt: new Date('2025-10-02'),
    updatedAt: new Date('2025-10-02'),
    publishedAt: new Date('2025-10-02'),
  },
  {
    id: 'exp-3',
    slug: 'gardsmat-opplevelse',
    name: 'Gårdsmat-opplevelse',
    description:
      'Matlagingskurs med lokale råvarer på en tradisjonell vestlandsgård. Lær å lage klassiske norske retter med moderne vri, fra flatbrød og rakfisk til nyskapende desserter med ville bær. Alt med råvarer hentet fra gårdens egen jord.',
    category: 'matopplevelse',
    images: [],
    basePrice: 189900,
    location: 'Voss, Vestland',
    durationText: '1 dag',
    difficulty: 'lett',
    whatIsIncluded: [
      'Matlagingskurs med kokk',
      'Alle råvarer',
      'Gårdsomvisning',
      'Lunsj og middag',
      'Oppskrifthefte',
    ],
    cancellationPolicy: 'Gratis avbestilling inntil 7 dager før. 50% refusjon inntil 3 dager før.',
    whatToBring: 'Komfortable klær, forkle (kan lånes), eventuelt eget kamera.',
    createdAt: new Date('2025-10-03'),
    updatedAt: new Date('2025-10-03'),
    publishedAt: new Date('2025-10-03'),
  },
  {
    id: 'exp-4',
    slug: 'villmarksretreat-ved-fjorden',
    name: 'Villmarksretreat ved fjorden',
    description:
      'Tre dagers retreat ved Sognefjorden der du kobler helt av fra hverdagen. Kombinerer fjellvandring, kajakkpadling og meditasjon med enkel, naturlig mat laget over bål. Sov i lavvo med utsikt over fjorden under stjernehimmelen.',
    category: 'retreat',
    images: [],
    basePrice: 599900,
    location: 'Sognefjorden, Vestland',
    durationText: '3 dager',
    difficulty: 'moderat',
    whatIsIncluded: [
      'Overnatting i lavvo',
      'Alle måltider (bålmat)',
      'Kajakk og utstyr',
      'Guidet fjellvandring',
      'Meditasjon og mindfulness',
      'Badstue ved fjorden',
    ],
    cancellationPolicy: 'Gratis avbestilling inntil 21 dager før. 50% refusjon inntil 14 dager før.',
    whatToBring: 'Turklær for all slags vær, badetøy, sovepose (kan leies), hodelykt.',
    createdAt: new Date('2025-10-04'),
    updatedAt: new Date('2025-10-04'),
    publishedAt: new Date('2025-10-04'),
  },
]

// ---------------------------------------------------------------------------
// Mock Experience Dates — a Map keyed by experience ID
// ---------------------------------------------------------------------------

function futureDate(daysFromNow: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(9, 0, 0, 0)
  return d
}

export const mockExperienceDates = new Map<string, ExperienceDate[]>([
  [
    'exp-1',
    [
      {
        id: 'ed-1a',
        date: futureDate(21),
        maxSeats: 12,
        bookedSeats: 7,
        availableSeats: 5,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-1b',
        date: futureDate(42),
        maxSeats: 12,
        bookedSeats: 3,
        availableSeats: 9,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-1c',
        date: futureDate(70),
        maxSeats: 12,
        bookedSeats: 0,
        availableSeats: 12,
        isActive: true,
        priceOverride: null,
      },
    ],
  ],
  [
    'exp-2',
    [
      {
        id: 'ed-2a',
        date: futureDate(14),
        maxSeats: 8,
        bookedSeats: 6,
        availableSeats: 2,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-2b',
        date: futureDate(35),
        maxSeats: 8,
        bookedSeats: 1,
        availableSeats: 7,
        isActive: true,
        priceOverride: null,
      },
    ],
  ],
  [
    'exp-3',
    [
      {
        id: 'ed-3a',
        date: futureDate(10),
        maxSeats: 10,
        bookedSeats: 8,
        availableSeats: 2,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-3b',
        date: futureDate(28),
        maxSeats: 10,
        bookedSeats: 4,
        availableSeats: 6,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-3c',
        date: futureDate(56),
        maxSeats: 10,
        bookedSeats: 0,
        availableSeats: 10,
        isActive: true,
        priceOverride: null,
      },
    ],
  ],
  [
    'exp-4',
    [
      {
        id: 'ed-4a',
        date: futureDate(30),
        maxSeats: 6,
        bookedSeats: 4,
        availableSeats: 2,
        isActive: true,
        priceOverride: null,
      },
      {
        id: 'ed-4b',
        date: futureDate(60),
        maxSeats: 6,
        bookedSeats: 1,
        availableSeats: 5,
        isActive: true,
        priceOverride: null,
      },
    ],
  ],
])

// ---------------------------------------------------------------------------
// Mock Articles
// ---------------------------------------------------------------------------

export const mockArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'skogens-hemmeligheter',
    title: 'Skogens hemmeligheter: Hva tr\u00e6rne forteller oss',
    excerpt:
      'Skogen er mye mer enn treverk og tursti\u00e9r. Oppdag det skjulte spr\u00e5ket mellom tr\u00e6rne og hvordan naturen kommuniserer p\u00e5 m\u00e5ter vi bare s\u00e5 vidt begynner \u00e5 forst\u00e5.',
    body: `<p>Dypt inne i de norske skogene foreg\u00e5r det en stille samtale vi sjelden legger merke til. Gjennom et underjordisk nettverk av soppmycel \u2014 ofte kalt \u00abwood wide web\u00bb \u2014 deler tr\u00e6rne n\u00e6ring, varsler om farer og st\u00f8tter hverandres vekst. Forskning viser at modertr\u00e6r sender sukker og mineraler til sine avkom gjennom disse nettverkene.</p>
<p>I Norge har vi noen av Europas eldste og mest intakte skoger. Fra de tette granskogene i \u00d8stmarka til de vindpiskede bj\u00f8rkeskogene i Nordland \u2014 hver skog har sin egen karakter og sine egne hemmeligheter. De som tar seg tid til \u00e5 lytte, kan h\u00f8re skogen puste.</p>
<p>Skogsbad, eller shinrin-yoku som det heter p\u00e5 japansk, handler nettopp om \u00e5 \u00e5pne sansene for skogens kvaliteter. Forskning fra b\u00e5de Japan og Skandinavia viser at regelmessige opphold i skogen senker blodtrykk, stresshormonet kortisol og styrker immunforsvaret.</p>
<p>N\u00e5r du neste gang g\u00e5r en tur i skogen, stopp opp et \u00f8yeblikk. Legg h\u00e5nden p\u00e5 barken til en gammel gran. Pust dypt inn. Du er ikke bare omgitt av natur \u2014 du er en del av den.</p>`,
    coverImage: { url: '', alt: 'Tett granskog med sollys mellom stammene' },
    author: 'Redaksjonen',
    tags: ['natur', 'skog', 'vitenskap'],
    status: 'published',
    metaTitle: 'Skogens hemmeligheter: Hva tr\u00e6rne forteller oss',
    metaDescription:
      'Oppdag det skjulte spr\u00e5ket mellom tr\u00e6rne og hvordan naturen kommuniserer.',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
    publishedAt: new Date('2025-11-01'),
  },
  {
    id: 'art-2',
    slug: 'gamle-tradisjoner-nye-opplevelser',
    title: 'Gamle tradisjoner, nye opplevelser',
    excerpt:
      'Norsk kulturarv lever videre gjennom nye generasjoner som gir tradisjonene nytt liv. Fra bunad til bålmat \u2014 det gamle og det nye m\u00f8tes p\u00e5 spennende m\u00e5ter.',
    body: `<p>Norge har en rik kulturarv som strekker seg tusenvis av \u00e5r tilbake. Fra vikingenes h\u00e5ndverk til seterlivet i fjellet \u2014 tradisjonene v\u00e5re er formet av naturen vi lever i. Men tradisjoner m\u00e5 ikke v\u00e6re statiske for \u00e5 v\u00e6re verdifulle.</p>
<p>Stadig flere unge nordmenn s\u00f8ker tilbake til r\u00f8ttene. De l\u00e6rer seg \u00e5 bake flatbr\u00f8d p\u00e5 takke, samle ville urter og syr sin egen bunad. Men de gj\u00f8r det p\u00e5 sine egne premisser \u2014 med moderne vri og \u00f8kologisk bevissthet.</p>
<p>P\u00e5 Roots &amp; Culture tror vi at de beste opplevelsene oppst\u00e5r n\u00e5r det gamle m\u00f8ter det nye. N\u00e5r du sitter rundt b\u00e5let med en kopp urte-te laget av planter du selv har sanket, kjenner du forbindelsen til generasjonene som har gjort det f\u00f8r deg.</p>
<p>Vi inviterer deg til \u00e5 oppdage norske tradisjoner p\u00e5 nytt \u2014 ikke som museumsgjenstander, men som levende, pustende opplevelser som beriker livet ditt.</p>`,
    coverImage: { url: '', alt: 'Tradisjonell norsk flatbr\u00f8dbaking over b\u00e5l' },
    author: 'Redaksjonen',
    tags: ['kultur', 'tradisjon', 'opplevelser'],
    status: 'published',
    metaTitle: 'Gamle tradisjoner, nye opplevelser',
    metaDescription:
      'Norsk kulturarv lever videre gjennom nye generasjoner som gir tradisjonene nytt liv.',
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-15'),
    publishedAt: new Date('2025-11-15'),
  },
  {
    id: 'art-3',
    slug: 'fra-fjord-til-fjell-norske-mattradisjoner',
    title: 'Fra fjord til fjell: Norske mattradisjoner',
    excerpt:
      'Norsk mat handler om \u00e5rstider, r\u00e5varer og respekt for naturen. Utforsk mattradisjoner fra kyst til fjell og finn inspirasjon til ditt eget kj\u00f8kken.',
    body: `<p>Norsk matkultur er uatskillelig fra landskapet. Fra torsken i Lofoten til multer p\u00e5 Finnmarksvidda \u2014 r\u00e5varene speiler naturen de kommer fra. I generasjoner har nordmenn konservert, t\u00f8rket, r\u00f8ykt og fermentert mat for \u00e5 overleve de lange vintrene.</p>
<p>I dag opplever disse gamle teknikkene en renessanse. Moderne kokker kombinerer tradisjonelle metoder som gravlaks, rakfisk og spekemat med nye smaker og presentasjoner. Resultatet er en matkultur som er b\u00e5de dypt forankret og fremtidsrettet.</p>
<p>P\u00e5 vestlandet finner du fortsatt g\u00e5rder der geiter beiter p\u00e5 fjellsider brattere enn de fleste t\u00f8r \u00e5 g\u00e5. Melken blir til brunost \u2014 den ikoniske, karamellaktige osten som deler verden i de som elsker den og de som ikke forst\u00e5r den.</p>
<p>Uansett om du er en erfaren kokk eller nybegynner p\u00e5 kj\u00f8kkenet, finnes det en hel verden av norske smaker \u00e5 utforske. Start med r\u00e5varene. G\u00e5 en tur i skogen, plukk noen b\u00e6r, finn litt ramsl\u00f8k. La naturen v\u00e6re ditt spisskammer.</p>`,
    coverImage: { url: '', alt: 'Tradisjonell norsk matrett med r\u00e5varer fra naturen' },
    author: 'Redaksjonen',
    tags: ['mat', 'tradisjon', 'r\u00e5varer'],
    status: 'published',
    metaTitle: 'Fra fjord til fjell: Norske mattradisjoner',
    metaDescription:
      'Utforsk norske mattradisjoner fra kyst til fjell og finn inspirasjon til ditt eget kj\u00f8kken.',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
    publishedAt: new Date('2025-12-01'),
  },
]

// ---------------------------------------------------------------------------
// Mock Site Content
// ---------------------------------------------------------------------------

export const mockSiteContent: SiteContent = {
  id: 'main',
  heroTitle: 'Opplev ekte norsk natur og kultur',
  heroIngress:
    'Vi bringer deg n\u00e6rmere naturen gjennom autentiske produkter og unike opplevelser forankret i norsk kulturarv.',
  aboutText:
    'Roots & Culture er en norsk nettbutikk som formidler h\u00e5ndplukkede naturprodukter og unike opplevelser fra hele Norge. Vi samarbeider med lokale produsenter, b\u00f8nder og guider som deler v\u00e5r lidenskap for norsk natur og kulturarv. V\u00e5rt m\u00e5l er \u00e5 gj\u00f8re det enkelt for deg \u00e5 oppleve det beste Norge har \u00e5 by p\u00e5 \u2014 enten det er gjennom en kopp urte-te fra fjellet eller et retreat ved fjorden.',
  updatedAt: new Date('2025-09-01'),
}
