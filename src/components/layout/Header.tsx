'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, ShoppingBag } from 'lucide-react'
import { MegaMenuNav } from './MegaMenuNav'
import { MobileNav } from './MobileNav'
import { AuthModal } from '@/components/auth/AuthModal'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { CartBadge } from '@/components/cart/CartBadge'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/components/cart/CartProvider'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register' | 'reset'>('login')
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()

  function handleAuthClose() {
    setAuthOpen(false)
    setAuthView('login')
  }

  function handleAuthOpen() {
    setAuthOpen(true)
    setMobileOpen(false)
  }

  const cartLabel = itemCount > 0
    ? `Handlekurv, ${itemCount} varer`
    : 'Handlekurv, tom'

  return (
    <header
      className="sticky top-0 z-50 flex h-16 items-center bg-cream/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 lg:px-8"
    >
      {/* Logo -- left */}
      <Link
        href="/"
        className="mr-auto flex items-center gap-2"
      >
        <Image
          src="/logo_black.png"
          alt="Roots & Culture"
          width={40}
          height={40}
          className="h-10 w-10"
          priority
        />
        <span className="hidden font-heading text-xl font-bold text-forest sm:inline">
          Roots &amp; Culture
        </span>
      </Link>

      {/* Desktop nav -- centered, hidden on mobile */}
      <nav className="hidden lg:flex" aria-label="Hovednavigasjon">
        <MegaMenuNav />
      </nav>

      {/* Right section: cart icon + auth trigger (desktop) */}
      <div className="ml-auto hidden items-center gap-2 lg:flex">
        {/* Cart button -- opens drawer */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded text-forest hover:opacity-85"
          aria-label={cartLabel}
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          <CartBadge />
        </button>

        {/* Auth trigger -- opens AuthModal */}
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-[15px] font-medium text-forest hover:bg-forest/8 motion-safe:transition-colors motion-safe:duration-150"
          onClick={() => setAuthOpen(true)}
          aria-label="Logg inn"
        >
          Logg inn
        </button>
      </div>

      {/* Mobile: cart icon + hamburger (visible below lg) */}
      <div className="ml-auto flex items-center gap-1 lg:hidden">
        {/* Cart button -- opens drawer (mobile) */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center"
          aria-label={cartLabel}
        >
          <ShoppingBag className="h-5 w-5 text-forest" aria-hidden="true" />
          <CartBadge />
        </button>

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
        <MobileNav onClose={() => setMobileOpen(false)} onLoginClick={handleAuthOpen} />
      )}

      {/* Cart drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={handleAuthClose}
        title={authView === 'login' ? 'Logg inn' : authView === 'register' ? 'Opprett konto' : 'Tilbakestill passord'}
      >
        {authView === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setAuthView('register')}
            onSwitchToReset={() => setAuthView('reset')}
            onSuccess={handleAuthClose}
          />
        )}
        {authView === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setAuthView('login')}
            onSuccess={handleAuthClose}
          />
        )}
        {authView === 'reset' && (
          <PasswordResetForm
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </AuthModal>
    </header>
  )
}
