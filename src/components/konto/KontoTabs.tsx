'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Oversikt', href: '/konto' },
  { label: 'Ordrer', href: '/konto/ordrer' },
  { label: 'Bookinger', href: '/konto/bookinger' },
  { label: 'Profil', href: '/konto/profil' },
]

export function KontoTabs() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/konto') {
      return pathname === '/konto'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav aria-label="Kontomeny" className="border-b border-forest/12 mb-8">
      <div className="flex overflow-x-auto -mb-px">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'min-h-[44px] flex items-center px-4 py-3 font-body text-[15px] whitespace-nowrap transition-colors duration-100',
                active
                  ? 'border-b-2 border-ember text-forest font-medium'
                  : 'text-body hover:text-forest'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
