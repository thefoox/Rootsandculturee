export interface NavItem {
  label: string
  href: string
  children?: NavCategory[]
}

export interface NavCategory {
  label: string
  href: string
  description?: string
  icon?: string
}

export const mainNavItems: NavItem[] = [
  {
    label: 'Produkter',
    href: '/produkter',
    children: [
      { label: 'Drikke', href: '/produkter?kategori=drikke', description: 'Tradisjonelle norske drikker', icon: 'wine' },
      { label: 'Kaffe og te', href: '/produkter?kategori=kaffe-te', description: 'Handplukket kaffe og urtete', icon: 'coffee' },
      { label: 'Naturprodukter', href: '/produkter?kategori=naturprodukter', description: 'Ekte fra norsk natur', icon: 'leaf' },
    ],
  },
  {
    label: 'Opplevelser',
    href: '/opplevelser',
    children: [
      { label: 'Naturretreater', href: '/opplevelser?kategori=retreat', description: 'Ro og fordypning i naturen', icon: 'mountain' },
      { label: 'Kurs', href: '/opplevelser?kategori=kurs', description: 'Laer tradisjoner og handverk', icon: 'book-open' },
      { label: 'Matopplevelser', href: '/opplevelser?kategori=matopplevelse', description: 'Smak norsk matkultur', icon: 'utensils' },
    ],
  },
  { label: 'Blogg', href: '/blogg' },
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Kontakt', href: '/kontakt' },
]

export interface FooterColumn {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Utforsk',
    links: [
      { label: 'Produkter', href: '/produkter' },
      { label: 'Opplevelser', href: '/opplevelser' },
      { label: 'Blogg', href: '/blogg' },
      { label: 'Om oss', href: '/om-oss' },
    ],
  },
  {
    title: 'Kundeservice',
    links: [
      { label: 'Kontakt oss', href: '/kontakt' },
      { label: 'Vanlige sporsmal', href: '/kontakt#faq' },
      { label: 'Frakt og retur', href: '/kontakt#frakt' },
    ],
  },
  {
    title: 'Folg oss',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/rootsculture', external: true },
      { label: 'Facebook', href: 'https://facebook.com/rootsculture', external: true },
    ],
  },
  {
    title: 'Kontakt',
    links: [
      { label: 'post@rootsculture.no', href: 'mailto:post@rootsculture.no' },
    ],
  },
]
