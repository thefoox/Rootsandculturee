'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, ShoppingBag } from 'lucide-react'
import { MegaMenuNav } from './MegaMenuNav'
import { MobileNav } from './MobileNav'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 flex h-16 items-center border-b border-forest/12 bg-card px-4 lg:px-8"
    >
      {/* Logo -- left */}
      <Link
        href="/"
        className="mr-auto font-heading text-xl font-bold text-forest"
      >
        Roots &amp; Culture
      </Link>

      {/* Desktop nav -- centered, hidden on mobile */}
      <nav className="hidden lg:flex" aria-label="Hovednavigasjon">
        <MegaMenuNav />
      </nav>

      {/* Right section: cart icon + auth trigger (desktop) */}
      <div className="ml-auto hidden items-center gap-2 lg:flex">
        {/* Cart icon placeholder per D-14 -- links to future /handlekurv route */}
        <Link
          href="/handlekurv"
          className="flex h-11 w-11 items-center justify-center rounded text-forest hover:opacity-85"
          aria-label="Handlekurv"
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        </Link>

        {/* Auth trigger -- placeholder until Plan 05 wires AuthModal */}
        <button
          type="button"
          className="text-[15px] text-forest hover:opacity-85"
          aria-label="Logg inn"
        >
          Logg inn
        </button>
      </div>

      {/* Mobile: cart icon + hamburger (visible below lg) */}
      <div className="ml-auto flex items-center gap-1 lg:hidden">
        {/* Cart icon placeholder per D-14 (mobile) */}
        <Link
          href="/handlekurv"
          className="flex h-11 w-11 items-center justify-center"
          aria-label="Handlekurv"
        >
          <ShoppingBag className="h-5 w-5 text-forest" aria-hidden="true" />
        </Link>

        {/* Hamburger */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center"
          onClick={() => setMobileOpen(true)}
          aria-label="Apne meny"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-6 w-6 text-forest" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <MobileNav onClose={() => setMobileOpen(false)} />
      )}
    </header>
  )
}
