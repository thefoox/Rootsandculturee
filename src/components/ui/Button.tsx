'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-cream shadow-sm hover:bg-forest/90 hover:shadow-md active:scale-[0.98]',
  secondary: 'border-2 border-forest text-forest hover:opacity-85 active:scale-[0.98]',
  ghost: 'text-forest hover:opacity-85 active:scale-[0.98]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-body text-body font-medium motion-safe:transition-all motion-safe:duration-150',
          'min-h-[44px]',
          variantStyles[variant],
          isDisabled && 'opacity-40 cursor-not-allowed hover:opacity-40',
          className
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Laster...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
