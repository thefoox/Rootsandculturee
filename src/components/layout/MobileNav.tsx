'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, ChevronDown, User, ShoppingBag, CalendarDays, LogOut, Shield } from 'lucide-react'
import { mainNavItems, type NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

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
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

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

  function toggleExpand(label: string) {
    setExpandedItem(expandedItem === label ? null : label)
  }

  return (
    <div
      ref={navRef}
      className="dark-surface fixed inset-0 z-[100] flex flex-col bg-forest"
      role="dialog"
      aria-modal="true"
      aria-label="Navigasjonsmeny"
    >
      {/* Header: user info (if logged in) + close button */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 text-[13px] font-semibold text-cream">
              {userEmail ? userEmail[0].toUpperCase() : '?'}
            </div>
            <span className="max-w-[200px] truncate text-[13px] text-cream/60">{userEmail}</span>
          </div>
        ) : (
          <div />
        )}
        <button
          ref={closeButtonRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream/10"
          onClick={onClose}
          aria-label="Lukk meny"
        >
          <X className="h-5 w-5 text-cream" aria-hidden="true" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-cream/10" />

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-6 py-5" aria-label="Mobilnavigasjon">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItem === item.label

            return (
              <li key={item.href}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3.5 font-heading text-[18px] font-bold text-cream hover:bg-cream/8"
                      onClick={() => toggleExpand(item.label)}
                      aria-expanded={isExpanded}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-cream/40 motion-safe:transition-transform motion-safe:duration-200',
                          isExpanded && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {isExpanded && (
                      <ul className="mb-1 ml-3 space-y-0.5 border-l border-cream/10 pl-3">
                        {item.children!.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-md px-3 py-2.5 text-[15px] text-cream/70 hover:bg-cream/8 hover:text-cream"
                              onClick={onClose}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3.5 font-heading text-[18px] font-bold text-cream hover:bg-cream/8"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="mx-6 border-t border-cream/10" />

        <div className="px-6 py-5">
          {isLoggedIn ? (
            <div className="space-y-1">
              <Link
                href="/konto"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-cream/70 hover:bg-cream/8 hover:text-cream"
                onClick={onClose}
              >
                <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                Min konto
              </Link>
              <Link
                href="/konto/ordrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-cream/70 hover:bg-cream/8 hover:text-cream"
                onClick={onClose}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                Mine ordrer
              </Link>
              <Link
                href="/konto/bookinger"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-cream/70 hover:bg-cream/8 hover:text-cream"
                onClick={onClose}
              >
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                Mine bookinger
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-cream/70 hover:bg-cream/8 hover:text-cream"
                  onClick={onClose}
                >
                  <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Admin
                </Link>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] text-cream/40 hover:text-cream/60"
                  onClick={() => { onLogout?.(); onClose() }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Logg ut
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full rounded-lg bg-cream py-3.5 text-center text-[15px] font-semibold text-forest hover:bg-cream/90 motion-safe:transition-colors"
              onClick={onLoginClick || onClose}
            >
              Logg inn
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
