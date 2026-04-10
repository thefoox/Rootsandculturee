'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  variant?: 'boxed' | 'underline'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, variant = 'boxed', required, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-label font-medium tracking-wide text-forest"
        >
          {label}
          {required && variant === 'underline' && (
            <span className="ml-0.5 text-rust" aria-hidden="true">*</span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            'font-body text-body text-forest',
            'motion-safe:transition-colors motion-safe:duration-150',
            variant === 'underline'
              ? cn(
                  'min-h-[44px] bg-transparent border-0 border-b-[1.5px] rounded-none px-3 py-3 placeholder:text-body/35',
                  error
                    ? 'border-destructive'
                    : 'border-forest/20 focus:border-forest focus:outline-none'
                )
              : cn(
                  'min-h-[44px] rounded-lg border bg-card px-4 py-3 placeholder:text-body/60',
                  error
                    ? 'border-destructive bg-destructive/5'
                    : 'border-forest/20 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15'
                ),
            className
          )}
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1 text-label text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
