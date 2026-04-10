'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/firebase/auth'
import { Package, TreePine, FileText, LayoutTemplate, ShoppingBag, CalendarDays, Gift, Users, ArrowLeft, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react'
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
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({ mobile, onClose, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()

  const isCollapsed = !mobile && collapsed

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-white border-r border-forest/12',
        isCollapsed ? 'w-[64px]' : 'w-[240px]',
        mobile && 'fixed inset-y-0 left-0 z-[250] w-[240px]'
      )}
      aria-label="Admin-navigasjon"
    >
      <div className={cn('flex items-center justify-between px-4 pb-4 pt-6', isCollapsed && 'justify-center px-0')}>
        {!isCollapsed && (
          <span className="font-body text-label text-forest">
            Roots &amp; Culture Admin
          </span>
        )}
        {mobile && (
          <button
            onClick={onClose}
            className="flex h-[44px] w-[44px] items-center justify-center text-forest"
            aria-label="Lukk admin-meny"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {!mobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex h-[44px] w-[44px] items-center justify-center text-forest hover:bg-card/60 rounded-md"
            aria-label={isCollapsed ? 'Vis navigasjon' : 'Skjul navigasjon'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1">
        {!isCollapsed && (
          <div className="px-4 pb-2 pt-6">
            <span className="text-label uppercase tracking-wider text-forest">
              Innhold
            </span>
          </div>
        )}
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
                    'flex h-[44px] items-center text-body text-forest',
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-4',
                    'hover:bg-card/60',
                    isActive && 'border-l-[3px] border-forest bg-card'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!isCollapsed && item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {isCollapsed && <div className="mx-auto my-2 w-6 border-t border-forest/12" />}

        {!isCollapsed && (
          <div className="px-4 pb-2 pt-6">
            <span className="text-label uppercase tracking-wider text-rust">
              Ordre & Kunder
            </span>
          </div>
        )}
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
                    'flex h-[44px] items-center text-body text-forest',
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-4',
                    'hover:bg-card/60',
                    isActive && 'border-l-[3px] border-forest bg-card'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!isCollapsed && item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('border-t border-forest/12', isCollapsed ? 'px-0 py-4' : 'px-4 py-4')}>
        <Link
          href="/"
          className={cn(
            'flex h-[44px] items-center text-body text-forest hover:bg-card/60',
            isCollapsed ? 'justify-center' : 'gap-3'
          )}
          aria-label={isCollapsed ? 'Tilbake til nettbutikk' : undefined}
          title={isCollapsed ? 'Tilbake til nettbutikk' : undefined}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && 'Tilbake til nettbutikk'}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut()
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/'
          }}
          className={cn(
            'flex h-[44px] w-full items-center text-body text-forest hover:text-destructive hover:bg-card/60',
            isCollapsed ? 'justify-center' : 'gap-3'
          )}
          aria-label={isCollapsed ? 'Logg ut' : undefined}
          title={isCollapsed ? 'Logg ut' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && 'Logg ut'}
        </button>
      </div>
    </aside>
  )
}
