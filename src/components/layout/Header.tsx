'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, ShoppingBag, User, LogOut } from 'lucide-react'
import { MegaMenuNav } from './MegaMenuNav'
import { MobileNav } from './MobileNav'
import { buildNavItems, mainNavItems, type NavItem } from '@/lib/navigation'
import type { PageContent } from '@/types'
import { AuthModal } from '@/components/auth/AuthModal'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { logoutAction } from '@/actions/auth'
import { CartBadge } from '@/components/cart/CartBadge'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/components/cart/CartProvider'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register' | 'reset'>('login')
  const [cartOpen, setCartOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(mainNavItems)
  const { itemCount } = useCart()
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 80

  // Pages with hero images get transparent header with light text
  const heroPages = ['/', '/opplevelser', '/opplevelser/retreat', '/opplevelser/kurs', '/opplevelser/matopplevelse', '/om-oss', '/kontakt']
  const isHeroPage = heroPages.includes(pathname) || pathname.startsWith('/opplevelser/') && !pathname.includes('/opplevelser/retreat') && !pathname.includes('/opplevelser/kurs') && !pathname.includes('/opplevelser/matopplevelse') && pathname !== '/opplevelser'
  // Simplify: any /opplevelser/* detail page also has hero
  const isTransparent = heroPages.includes(pathname) || (pathname.startsWith('/opplevelser/') && pathname.split('/').length === 3)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setIsLoggedIn(data.authenticated))
      .catch(() => setIsLoggedIn(false))
  }, [])

  // Fetch dynamic navigation from CMS
  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((pages: PageContent[]) => {
        setNavItems(buildNavItems(pages))
      })
      .catch(() => {
        // Keep static fallback on error
      })
  }, [])

  async function handleLogout() {
    try {
      await logoutAction()
    } catch {
      // redirect() throws NEXT_REDIRECT — expected
    }
    window.location.href = '/'
  }

  function handleAuthClose() {
    setAuthOpen(false)
    setAuthView('login')
  }

  function handleLoginSuccess() {
    setAuthOpen(false)
    setAuthView('login')
    setIsLoggedIn(true)
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
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-center motion-safe:transition-all motion-safe:duration-200',
          isTransparent
            ? isScrolled
              ? 'bg-forest text-cream shadow-md'
              : 'bg-transparent'
            : isScrolled
              ? 'bg-cream shadow-md'
              : 'bg-cream/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
        )}
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
            className={`h-12 w-12 ${isTransparent ? 'brightness-0 invert' : ''}`}
            priority
          />
        </Link>

        {/* Desktop nav -- centered, hidden on mobile */}
        <nav className="hidden lg:flex" aria-label="Hovednavigasjon">
          <MegaMenuNav transparent={isTransparent} items={navItems} />
        </nav>

        {/* Right section: cart icon + auth trigger (desktop) */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className={`relative flex h-11 w-11 items-center justify-center rounded hover:opacity-85 ${isTransparent ? 'text-cream' : 'text-forest'}`}
            aria-label={cartLabel}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <CartBadge />
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isTransparent ? 'bg-cream/20 text-cream hover:bg-cream/30' : 'bg-forest/10 text-forest hover:bg-forest/20'
                }`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Min konto"
                aria-expanded={profileOpen}
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border border-forest/10 bg-cream py-2 shadow-lg">
                  <Link href="/konto" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-body text-forest hover:bg-card">
                    Min konto
                  </Link>
                  <Link href="/konto/ordrer" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-body text-forest hover:bg-card">
                    Mine ordrer
                  </Link>
                  <Link href="/konto/bookinger" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-body text-forest hover:bg-card">
                    Mine bookinger
                  </Link>
                  <hr className="my-1 border-forest/10" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-body text-forest hover:bg-card">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logg ut
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-body font-medium motion-safe:transition-colors motion-safe:duration-150 ${
                isTransparent
                  ? 'bg-cream/20 text-cream hover:bg-cream/30'
                  : 'bg-forest text-cream hover:bg-forest/80'
              }`}
              onClick={() => setAuthOpen(true)}
              aria-label="Logg inn"
            >
              Logg inn
            </button>
          )}
        </div>

        {/* Mobile: cart icon + hamburger (visible below lg) */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center"
            aria-label={cartLabel}
          >
            <ShoppingBag className={`h-5 w-5 ${isTransparent ? 'text-cream' : 'text-forest'}`} aria-hidden="true" />
            <CartBadge />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Åpne meny"
            aria-expanded={mobileOpen}
          >
            <Menu className={`h-6 w-6 ${isTransparent ? 'text-cream' : 'text-forest'}`} aria-hidden="true" />
          </button>
        </div>
      </div>
      </header>

      {/* Overlays rendered OUTSIDE header to avoid backdrop-blur containing block */}
      {mobileOpen && (
        <MobileNav onClose={() => setMobileOpen(false)} onLoginClick={handleAuthOpen} items={navItems} />
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
            onSuccess={handleLoginSuccess}
          />
        )}
        {authView === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setAuthView('login')}
            onSuccess={handleLoginSuccess}
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
