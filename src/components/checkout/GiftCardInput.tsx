'use client'

import { useState } from 'react'
import { Ticket, Check, X, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { validateGiftCardAction } from '@/actions/gift-cards'

interface GiftCardInputProps {
  onApply: (code: string, balance: number) => void
  onRemove: () => void
  appliedCode: string | null
  appliedBalance: number | null
}

export function GiftCardInput({
  onApply,
  onRemove,
  appliedCode,
  appliedBalance,
}: GiftCardInputProps) {
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [validBalance, setValidBalance] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  async function handleCheck() {
    if (!code.trim()) {
      setError('Skriv inn en gavekort-kode.')
      return
    }

    setChecking(true)
    setError('')
    setValidBalance(null)

    const result = await validateGiftCardAction(code.trim())

    if (result.valid) {
      setValidBalance(result.balance)
    } else {
      setError(result.error)
    }
    setChecking(false)
  }

  function handleApply() {
    if (validBalance !== null) {
      onApply(code.toUpperCase().trim(), validBalance)
      setCode('')
      setValidBalance(null)
    }
  }

  function handleRemove() {
    onRemove()
    setCode('')
    setValidBalance(null)
    setError('')
  }

  // Applied state -- compact inline display
  if (appliedCode && appliedBalance !== null) {
    return (
      <div className="mt-5 pt-4 border-t border-[#e8e3da]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-badge-easy" aria-hidden="true" />
            <span className="text-[13px] font-medium text-forest">
              Gavekort brukt
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-[44px] items-center gap-1 px-2 text-[13px] text-body hover:text-destructive"
            aria-label="Fjern gavekort"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Fjern
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[13px] text-body/70">{appliedCode}</span>
          <span className="text-[14px] font-medium text-forest">-{formatPrice(appliedBalance)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-5 pt-4 border-t border-[#e8e3da]">
      {/* Disclosure trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 py-1 text-left text-[13px] font-medium text-forest opacity-70 hover:opacity-100 motion-safe:transition-opacity"
        aria-expanded={isOpen}
      >
        <Ticket className="h-4 w-4" aria-hidden="true" />
        Har du et gavekort?
        <ChevronDown
          className={cn(
            'ml-auto h-3.5 w-3.5 motion-safe:transition-transform',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible panel */}
      {isOpen && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
                setValidBalance(null)
              }}
              placeholder="RC-XXXX-XXXX"
              className="flex-1 rounded-md border border-forest/20 bg-cream px-3 py-2.5 font-body text-[13px] text-forest placeholder:opacity-40 focus:border-forest focus:outline-none"
              aria-label="Gavekort-kode"
            />
            <button
              type="button"
              onClick={handleCheck}
              disabled={!code.trim() || checking}
              className="rounded-md bg-forest px-4 py-2.5 text-[13px] font-semibold text-cream whitespace-nowrap hover:bg-[#153a2a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checking ? 'Sjekker...' : 'Bruk'}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[12px] text-destructive" role="alert">{error}</p>
          )}

          {validBalance !== null && (
            <div className="mt-3 rounded-md border border-forest/12 bg-cream p-3">
              <p className="text-[13px] text-forest">
                Tilgjengelig saldo: <strong>{formatPrice(validBalance)}</strong>
              </p>
              <button
                type="button"
                onClick={handleApply}
                className="mt-2 rounded-md bg-forest px-4 py-2 text-[13px] font-semibold text-cream hover:bg-[#153a2a]"
              >
                Bruk gavekort
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
