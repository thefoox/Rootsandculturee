'use client'

import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface ContentBlockEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  id?: string
}

export function ContentBlockEditor({
  label,
  value,
  onChange,
  multiline = false,
  id,
}: ContentBlockEditorProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  if (multiline) {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-[13px] font-normal tracking-wide text-forest"
        >
          {label}
        </label>
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className={cn(
            'min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-body/60',
            'transition-colors duration-100 focus:border-forest'
          )}
        />
      </div>
    )
  }

  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      id={inputId}
    />
  )
}
