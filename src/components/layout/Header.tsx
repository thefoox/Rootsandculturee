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
    <>
      <header
        className="absolute top-0 left-0 right-0 z-50 flex h-20 items-center justify-center"
      >
      <div className="flex w-full max-w-[1200px] items-center px-6 lg:px-8">
        {/* Logo -- left */}
        <Link
          href="/"
          className="mr-auto flex items-center gap-2"
        >
          <Image
            src="/logo_black.png"
            alt="Roots & Culture"
            width={48}
            height={48}
            className="h-12 w-12 brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop nav -- centered, hidden on mobile */}
        <nav className="hidden lg:flex" aria-label="Hovednavigasjon">
          <MegaMenuNav />
        </nav>

        {/* Right section: cart icon + auth trigger (desktop) */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded text-cream hover:opacity-85"
            aria-label={cartLabel}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <CartBadge />
          </button>

          <button
            type="button"
            className="rounded-full bg-forest px-4 py-2 text-[14px] font-medium text-cream motion-safe:transition-colors motion-safe:duration-150 hover:bg-forest/80"
            onClick={() => setAuthOpen(true)}
            aria-label="Logg inn"
          >
            Logg inn
          </button>
        </div>

        {/* Mobile: cart icon + hamburger (visible below lg) */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center"
            aria-label={cartLabel}
          >
            <ShoppingBag className="h-5 w-5 text-cream" aria-hidden="true" />
            <CartBadge />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Apne meny"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6 text-cream" aria-hidden="true" />
          </button>
        </div>
      </div>
      </header>

      {/* Overlays rendered OUTSIDE header to avoid backdrop-blur containing block */}
      {mobileOpen && (
        <MobileNav onClose={() => setMobileOpen(false)} onLoginClick={handleAuthOpen} />
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

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
    </>
  )
}
