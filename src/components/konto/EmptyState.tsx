import { Package } from 'lucide-react'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-10 w-10 text-body/40 mb-3" aria-hidden="true" />
      <p className="text-body text-[15px]">{message}</p>
    </div>
  )
}
