'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-forest/10 bg-cream p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:p-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-body text-body">
          Vi bruker informasjonskapsler for sesjonshåndtering og handlekurv.{' '}
          <Link href="/personvern" className="underline hover:text-forest">
            Les mer
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="rounded-full border border-forest/20 px-5 py-2 text-body font-medium text-forest hover:bg-card"
          >
            Avslå
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-forest px-5 py-2 text-body font-medium text-cream hover:bg-forest/90"
          >
            Godta
          </button>
        </div>
      </div>
    </div>
  )
}
