import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  id: string
  message: string
  className?: string
}

export function FormError({ id, message, className }: FormErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-[13px] text-destructive',
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
