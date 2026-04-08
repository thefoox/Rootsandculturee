'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  once?: boolean
}

/**
 * Returns a ref to attach to the element and a boolean indicating if it's visible.
 * Uses IntersectionObserver with 0.15 threshold (15% visible triggers).
 * Respects prefers-reduced-motion — if user prefers reduced motion, isVisible is always true.
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.15, once = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // If user prefers reduced motion, skip animation and show immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setIsVisible(true)
      return
    }

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) observer.unobserve(element)
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, isVisible }
}
