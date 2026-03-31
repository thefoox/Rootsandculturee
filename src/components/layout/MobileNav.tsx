'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { mainNavItems } from '@/lib/navigation'

interface MobileNavProps {
  onClose: () => void
  onLoginClick?: () => void
}

export function MobileNav({ onClose, onLoginClick }: MobileNavProps) {
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
          {mainNavItems.map((item) => (
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
                        className="block py-2 text-[15px] text-cream/70 hover:text-cream"
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

      {/* Login button at bottom */}
      <div className="px-8 pb-8">
        <button
          type="button"
          className="w-full rounded-md bg-forest py-3 text-center font-body text-[15px] font-medium text-cream"
          onClick={onLoginClick || onClose}
        >
          Logg inn
        </button>
      </div>
    </div>
  )
}
