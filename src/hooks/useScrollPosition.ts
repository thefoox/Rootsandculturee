'use client'

import { useState, useEffect } from 'react'

/**
 * Returns current window.scrollY, updated on scroll.
 * Uses passive listener for performance.
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Set initial value in case page loads scrolled
    setScrollY(window.scrollY)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}
