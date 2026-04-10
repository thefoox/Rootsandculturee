'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/firebase/auth'
import { Package, TreePine, FileText, LayoutTemplate, ShoppingBag, CalendarDays, Gift, Users, ArrowLeft, LogOut, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const contentNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin/produkter', label: 'Produkter', icon: Package },
  { href: '/admin/opplevelser', label: 'Opplevelser', icon: TreePine },
  { href: '/admin/artikler', label: 'Artikler', icon: FileText },
  { href: '/admin/innhold', label: 'Sideinnhold', icon: LayoutTemplate },
]

const orderNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin/ordrer', label: 'Ordrer', icon: ShoppingBag },
  { href: '/admin/bookinger', label: 'Bookinger', icon: CalendarDays },
  { href: '/admin/gavekort', label: 'Gavekort', icon: Gift },
  { href: '/admin/kunder', label: 'Kunder', icon: Users },
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
        'flex h-full w-[240px] flex-col bg-white border-r border-forest/12',
        mobile && 'fixed inset-y-0 left-0 z-[250]'
      )}
    >
      <div className="flex items-center justify-between px-4 pb-4 pt-6">
        <span className="font-body text-label text-forest">
          Roots &amp; Culture Admin
        </span>
        {mobile && (
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center text-forest"
            aria-label="Lukk admin-meny"
          >
            <X className="h-5 w-5" aria-hidden="true" />
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
                    'flex h-[44px] items-center gap-3 px-4 text-body text-forest',
                    'hover:bg-card/60',
                    isActive &&
                      'border-l-[3px] border-forest bg-card'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
                    'flex h-[44px] items-center gap-3 px-4 text-body text-forest',
                    'hover:bg-card/60',
                    isActive &&
                      'border-l-[3px] border-forest bg-card'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-forest/12 px-4 py-4">
        <Link
          href="/"
          className="flex h-[44px] items-center gap-3 text-body text-forest hover:bg-card/60"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
          Tilbake til nettbutikk
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut()
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/'
          }}
          className="flex h-[44px] w-full items-center gap-3 text-body text-forest hover:text-destructive hover:bg-card/60"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          Logg ut
        </button>
      </div>
    </aside>
  )
}
