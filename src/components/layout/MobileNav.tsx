'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, User, ShoppingBag, CalendarDays, LogOut, Shield } from 'lucide-react'
import { mainNavItems, type NavItem } from '@/lib/navigation'

interface MobileNavProps {
  onClose: () => void
  onLoginClick?: () => void
  items?: NavItem[]
  isLoggedIn?: boolean
  userEmail?: string | null
  isAdmin?: boolean
  onLogout?: () => void
}

export function MobileNav({ onClose, onLoginClick, items, isLoggedIn, userEmail, isAdmin, onLogout }: MobileNavProps) {
  const navItems = items || mainNavItems
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Focus close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Focus trap
  useEffect(() => {
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !navRef.current) return
      const focusable = navRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [])

  return (
    <div
      ref={navRef}
      className="dark-surface fixed inset-0 z-[100] flex flex-col bg-forest"
      role="dialog"
      aria-modal="true"
      aria-label="Navigasjonsmeny"
    >
      {/* Close button -- top right */}
      <div className="flex h-16 items-center justify-end px-4">
        <button
          ref={closeButtonRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center"
          onClick={onClose}
          aria-label="Lukk meny"
        >
          <X className="h-6 w-6 text-cream" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-8 pt-4" aria-label="Mobilnavigasjon">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3 font-heading text-2xl font-bold text-cream hover:text-cream/80"
                onClick={onClose}
              >
                {item.label}
              </Link>
              {item.children && (
                <ul className="ml-4 space-y-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block py-2 text-body text-cream/70 hover:text-cream"
                        onClick={onClose}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section: auth-aware */}
      <div className="px-8 pb-8">
        {isLoggedIn ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-[14px] font-semibold text-forest">
                {userEmail ? userEmail[0].toUpperCase() : '?'}
              </div>
              <span className="truncate text-[14px] text-cream/70">{userEmail}</span>
            </div>

            {/* Account links */}
            <nav aria-label="Kontomeny">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/konto"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body text-cream/80 hover:bg-cream/10 hover:text-cream"
                    onClick={onClose}
                  >
                    <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Min konto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/konto/ordrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body text-cream/80 hover:bg-cream/10 hover:text-cream"
                    onClick={onClose}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Mine ordrer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/konto/bookinger"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body text-cream/80 hover:bg-cream/10 hover:text-cream"
                    onClick={onClose}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Mine bookinger
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body text-cream/80 hover:bg-cream/10 hover:text-cream"
                      onClick={onClose}
                    >
                      <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Logout */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-cream/20 py-3 text-body font-medium text-cream/70 hover:border-cream/40 hover:text-cream"
              onClick={() => { onLogout?.(); onClose() }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logg ut
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full rounded-md bg-cream/15 py-3 text-center font-body text-body font-medium text-cream hover:bg-cream/25"
            onClick={onLoginClick || onClose}
          >
            Logg inn
          </button>
        )}
      </div>
    </div>
  )
}
