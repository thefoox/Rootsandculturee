'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-[13px] font-normal tracking-wide text-forest"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-[44px] rounded-md border bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-body/60',
            'transition-colors duration-100',
            error
              ? 'border-destructive'
              : 'border-forest/20 focus:border-forest',
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
            className="flex items-center gap-1 text-[13px] text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
