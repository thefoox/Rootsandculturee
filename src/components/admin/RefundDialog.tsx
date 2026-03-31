'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { createRefund } from '@/actions/refunds'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'

type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent'

const reasonOptions: { value: RefundReason; label: string }[] = [
  { value: 'requested_by_customer', label: 'Kundens onske' },
  { value: 'duplicate', label: 'Duplikat betaling' },
  { value: 'fraudulent', label: 'Svindel' },
]

interface RefundDialogProps {
  isOpen: boolean
  onClose: () => void
  onRefunded: () => void
  orderId: string
  orderTotal: number        // ore
  alreadyRefunded: number   // ore
}

export function RefundDialog({
  isOpen,
  onClose,
  onRefunded,
  orderId,
  orderTotal,
  alreadyRefunded,
}: RefundDialogProps) {
  const [mode, setMode] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [reason, setReason] = useState<RefundReason>('requested_by_customer')
  const [isProcessing, setIsProcessing] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const remaining = orderTotal - alreadyRefunded

  useEffect(() => {
    if (isOpen) {
      setMode('full')
      setPartialAmount('')
      setReason('requested_by_customer')
      setTimeout(() => cancelRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleRefund() {
    let amountToRefund: number | undefined

    if (mode === 'partial') {
      const parsed = Math.round(parseFloat(partialAmount) * 100) // NOK to ore
      if (isNaN(parsed) || parsed <= 0) {
        toast.error('Ugyldig belop. Skriv inn et positivt tall.')
        return
      }
      if (parsed > remaining) {
        toast.error(`Belopet kan ikke overstige ${formatPrice(remaining)}.`)
        return
      }
      amountToRefund = parsed
    }

    setIsProcessing(true)
    const result = await createRefund(orderId, amountToRefund, reason)
    setIsProcessing(false)

    if (result.success) {
      toast.success('Refusjon gjennomfort.')
      onRefunded()
      onClose()
    } else {
      toast.error(result.error || 'Kunne ikke gjennomfore refusjon.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-dialog-title"
        className="relative z-10 w-full max-w-md rounded-lg bg-cream p-8 shadow-lg"
      >
        <h2
          id="refund-dialog-title"
          className="font-heading text-h4 font-bold text-forest"
        >
          Refunder betaling
        </h2>

        <div className="mt-4 space-y-3 font-body text-body">
          <p className="text-body">
            Ordretotal: <span className="font-medium text-forest">{formatPrice(orderTotal)}</span>
          </p>
          {alreadyRefunded > 0 && (
            <p className="text-[#C0392B]">
              Allerede refundert: {formatPrice(alreadyRefunded)}
            </p>
          )}
          <p className="text-body">
            Gjenstande: <span className="font-medium text-forest">{formatPrice(remaining)}</span>
          </p>
        </div>

        <div className="mt-4">
          <fieldset>
            <legend className="font-body text-label font-medium text-forest">
              Type refusjon
            </legend>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 font-body text-body text-forest">
                <input
                  type="radio"
                  name="refund-mode"
                  checked={mode === 'full'}
                  onChange={() => setMode('full')}
                  className="accent-forest"
                />
                Full ({formatPrice(remaining)})
              </label>
              <label className="flex items-center gap-2 font-body text-body text-forest">
                <input
                  type="radio"
                  name="refund-mode"
                  checked={mode === 'partial'}
                  onChange={() => setMode('partial')}
                  className="accent-forest"
                />
                Delvis
              </label>
            </div>
          </fieldset>
        </div>

        {mode === 'partial' && (
          <div className="mt-4">
            <label
              htmlFor="refund-amount"
              className="block font-body text-label font-medium text-forest"
            >
              Belop (NOK)
            </label>
            <input
              id="refund-amount"
              type="number"
              min="1"
              max={remaining / 100}
              step="1"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder={`Maks ${(remaining / 100).toFixed(0)}`}
              className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>
        )}

        <div className="mt-4">
          <label
            htmlFor="refund-reason"
            className="block font-body text-label font-medium text-forest"
          >
            Arsak
          </label>
          <select
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as RefundReason)}
            className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {reasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            variant="primary"
            className="bg-destructive text-cream hover:bg-destructive/90"
            onClick={handleRefund}
            loading={isProcessing}
          >
            {isProcessing ? 'Behandler...' : 'Gjennomfor refusjon'}
          </Button>
        </div>
      </div>
    </div>
  )
}
