'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/actions/auth'

const contentNavItems = [
  { href: '/admin/produkter', label: 'Produkter' },
  { href: '/admin/opplevelser', label: 'Opplevelser' },
  { href: '/admin/artikler', label: 'Artikler' },
  { href: '/admin/innhold', label: 'Sideinnhold' },
]

const orderNavItems = [
  { href: '/admin/ordrer', label: 'Ordrer' },
  { href: '/admin/bookinger', label: 'Bookinger' },
  { href: '/admin/gavekort', label: 'Gavekort' },
  { href: '/admin/kunder', label: 'Kunder' },
]

interface AdminSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'dark-surface flex h-full w-[240px] flex-col bg-admin-sidebar',
        mobile && 'fixed inset-y-0 left-0 z-[250]'
      )}
    >
      <div className="flex items-center justify-between px-4 pb-4 pt-6">
        <span className="font-body text-label text-cream">
          Roots &amp; Culture Admin
        </span>
        {mobile && (
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center text-cream"
            aria-label="Lukk admin-meny"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <nav aria-label="Admin-navigasjon" className="flex-1">
        <div className="px-4 pb-2 pt-6">
          <span className="text-label uppercase tracking-wider text-forest">
            Innhold
          </span>
        </div>
        <ul className="flex flex-col">
          {contentNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex h-[44px] items-center px-4 text-body text-cream',
                    'hover:bg-[rgba(254,252,243,0.08)]',
                    isActive &&
                      'border-l-[3px] border-forest bg-[rgba(254,252,243,0.08)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="px-4 pb-2 pt-6">
          <span className="text-label uppercase tracking-wider text-rust">
            Ordre & Kunder
          </span>
        </div>
        <ul className="flex flex-col">
          {orderNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex h-[44px] items-center px-4 text-body text-cream',
                    'hover:bg-[rgba(254,252,243,0.08)]',
                    isActive &&
                      'border-l-[3px] border-forest bg-[rgba(254,252,243,0.08)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-cream/10 px-4 py-4">
        <Link
          href="/"
          className="flex h-[44px] items-center gap-2 text-body text-cream hover:bg-[rgba(254,252,243,0.08)]"
        >
          <span aria-hidden="true">←</span>
          Tilbake til nettbutikk
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-[44px] w-full items-center text-body text-cream hover:bg-[rgba(254,252,243,0.08)]"
          >
            Logg ut
          </button>
        </form>
      </div>
    </aside>
  )
}
