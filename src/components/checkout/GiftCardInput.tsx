'use client'

import { useState } from 'react'
import { Ticket, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
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

  // Show applied state
  if (appliedCode && appliedBalance !== null) {
    return (
      <div className="rounded-lg border border-forest/12 bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-badge-easy" aria-hidden="true" />
            <span className="font-body text-body font-medium text-forest">
              Gavekort brukt
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-[44px] items-center gap-1 px-2 text-label text-body hover:text-destructive"
            aria-label="Fjern gavekort"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Fjern
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-body text-label text-body">{appliedCode}</span>
          <span className="font-body text-body font-medium text-forest">
            −{formatPrice(appliedBalance)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-forest/12 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="h-4 w-4 text-forest" aria-hidden="true" />
        <span className="font-body text-body font-medium text-forest">
          Har du et gavekort?
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label="Gavekort-kode"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
              setValidBalance(null)
            }}
            placeholder="RC-XXXX-XXXX"
            error={error}
          />
        </div>
        <div className="pt-[22px]">
          <Button
            variant="secondary"
            onClick={handleCheck}
            loading={checking}
            disabled={!code.trim()}
            type="button"
          >
            Sjekk
          </Button>
        </div>
      </div>

      {validBalance !== null && (
        <div className="mt-3 rounded-md border border-forest/12 bg-cream p-3">
          <p className="font-body text-body text-forest">
            Tilgjengelig saldo: <strong>{formatPrice(validBalance)}</strong>
          </p>
          <div className="mt-2">
            <Button variant="primary" onClick={handleApply} type="button">
              Bruk gavekort
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
