import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  body: string
}

export function EmptyState({ icon: Icon, heading, body }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
      <Icon className="h-12 w-12 text-forest" aria-hidden="true" />
      <h2 className="mt-4 font-heading text-[20px] font-bold text-forest">
        {heading}
      </h2>
      <p className="mt-2 font-body text-[15px] text-body">
        {body}
      </p>
    </div>
  )
}
