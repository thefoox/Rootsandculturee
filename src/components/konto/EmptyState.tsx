import Link from 'next/link'
import { Package } from 'lucide-react'

interface EmptyStateProps {
  message: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-10 w-10 text-body/40 mb-3" aria-hidden="true" />
      <p className="text-body">{message}</p>
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
