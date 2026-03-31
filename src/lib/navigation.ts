import type { PageContent } from '@/types'

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

// Fixed mega-menu items that have subcategories (dedicated routes)
const fixedNavItems: NavItem[] = [
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
      { label: 'Alle opplevelser', href: '/opplevelser', description: 'Se alle naturopplevelser', icon: 'mountain' },
      { label: 'Naturretreater', href: '/opplevelser/retreat', description: 'Ro og fordypning i naturen', icon: 'mountain' },
      { label: 'Kurs', href: '/opplevelser/kurs', description: 'Laer tradisjoner og handverk', icon: 'book-open' },
      { label: 'Matopplevelser', href: '/opplevelser/matopplevelse', description: 'Smak norsk matkultur', icon: 'utensils' },
    ],
  },
]

// Fixed slug -> dedicated route mapping (these don't use the [slug] catch-all)
const dedicatedRoutes: Record<string, string> = {
  produkter: '/produkter',
  opplevelser: '/opplevelser',
  blogg: '/blogg',
}

export function buildNavItems(navPages: PageContent[]): NavItem[] {
  // Start with fixed mega-menu items
  const items: NavItem[] = [...fixedNavItems]

  // Add CMS pages that aren't already covered by fixed items
  const fixedSlugs = new Set(['produkter', 'opplevelser'])

  for (const page of navPages) {
    if (fixedSlugs.has(page.slug)) continue

    const href = dedicatedRoutes[page.slug] || `/${page.slug}`
    items.push({ label: page.title, href })
  }

  return items
}

// Static fallback (used when nav pages haven't loaded yet)
export const mainNavItems: NavItem[] = [
  ...fixedNavItems,
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
      { label: 'Gavekort', href: '/gavekort' },
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
      { label: 'Personvern', href: '/personvern' },
      { label: 'Vilkar', href: '/vilkar' },
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
