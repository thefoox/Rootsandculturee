import type { ElementType } from 'react'

interface EmptyStateProps {
  icon: ElementType | string
  heading: string
  body: string
}

export function EmptyState({ icon: Icon, heading, body }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
      {typeof Icon === 'string' ? (
        <span className="text-4xl text-forest" aria-hidden="true">{Icon}</span>
      ) : (
        <Icon className="h-12 w-12 text-forest" aria-hidden="true" />
      )}
      <h2 className="mt-4 font-heading text-h4 font-bold text-forest">
        {heading}
      </h2>
      <p className="mt-2 font-body text-body">
        {body}
      </p>
    </div>
  )
}
