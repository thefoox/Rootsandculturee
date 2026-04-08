'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: 0 | 100 | 200 | 300
}

/**
 * Wraps children in a fade-up reveal animation on scroll.
 * Children are immediately visible if prefers-reduced-motion: reduce.
 * delay is in milliseconds: 0, 100, 200, or 300.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal()

  const delayClass = {
    0: '',
    100: 'motion-safe:[transition-delay:100ms]',
    200: 'motion-safe:[transition-delay:200ms]',
    300: 'motion-safe:[transition-delay:300ms]',
  }[delay]

  return (
    <div
      ref={ref}
      className={cn(
        'motion-safe:transition-all motion-safe:duration-500',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'motion-safe:opacity-0 motion-safe:translate-y-4',
        delayClass,
        className
      )}
    >
      {children}
    </div>
  )
}
