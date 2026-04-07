import Link from 'next/link'
import type { ElementType } from 'react'

interface EmptyStateProps {
  icon?: ElementType
  heading?: string
  message: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ icon: Icon, heading, message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <Icon className="h-10 w-10 text-body/40 mb-3" aria-hidden="true" />
      )}
      {heading && (
        <h3 className="font-heading text-h4 font-bold text-forest mb-1">
          {heading}
        </h3>
      )}
      <p className="font-body text-body text-body/70">{message}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center rounded-full border border-forest px-4 py-2 font-body text-label font-medium text-forest motion-safe:transition-colors motion-safe:duration-150 hover:bg-forest hover:text-cream"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
