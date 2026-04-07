'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'

const PRESET_AMOUNTS = [500, 1000, 2000, 3000] // NOK
const MIN_CUSTOM = 100
const MAX_CUSTOM = 10000

export default function GavekortPage() {
  const { addItem } = useCart()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const effectiveAmount = isCustom ? parseInt(customAmount) || 0 : (selectedAmount ?? 0)
  const amountInOre = effectiveAmount * 100

  function handlePresetSelect(amount: number) {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount('')
    setErrors((prev) => ({ ...prev, amount: '' }))
  }

  function handleCustomSelect() {
    setIsCustom(true)
    setSelectedAmount(null)
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (effectiveAmount <= 0) {
      newErrors.amount = 'Velg et beløp.'
    } else if (isCustom && (effectiveAmount < MIN_CUSTOM || effectiveAmount > MAX_CUSTOM)) {
      newErrors.amount = `Beløp må være mellom ${MIN_CUSTOM} og ${MAX_CUSTOM} kr.`
    }

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Mottakers navn er påkrevd.'
    }
    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = 'Mottakers e-post er påkrevd.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = 'Ugyldig e-postadresse.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleAddToCart() {
    if (!validate()) return

    addItem({
      id: `giftcard-${Date.now()}`,
      type: 'giftcard',
      name: `Gavekort ${formatPrice(amountInOre)}`,
      price: amountInOre,
      quantity: 1,
      image: null,
      slug: 'gavekort',
      variantId: null,
      variantLabel: null,
      // Store recipient info in existing nullable fields for giftcard items
      experienceDateId: message || null,       // greeting message
      experienceDate: recipientEmail || null,   // recipient email
      experienceName: recipientName || null,    // recipient name
      isEarlybird: null,
      originalPrice: null,
    })

    toast.success('Gavekort lagt i handlekurven.')

    // Reset form
    setRecipientName('')
    setRecipientEmail('')
    setMessage('')
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-[720px] px-4 pt-24 pb-16 md:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Gift className="h-8 w-8 text-forest" aria-hidden="true" />
          <h1 className="font-heading text-h2 font-bold text-forest">
            Kjøp gavekort
          </h1>
        </div>

        <p className="mb-8 font-body text-body leading-[1.7] text-forest">
          Gi bort en naturopplevelse eller et produkt fra Roots & Culture.
          Mottakeren får en unik kode som kan brukes i nettbutikken.
          Gavekortet er gyldig i 12 måneder.
        </p>

        {/* Amount selection */}
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Velg beløp
          </h2>
          <div className="flex flex-wrap gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetSelect(amount)}
                className={cn(
                  'rounded-lg border px-6 py-3 font-body text-body font-medium',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
                  !isCustom && selectedAmount === amount
                    ? 'border-2 border-forest bg-forest text-cream'
                    : 'border-forest/15 bg-card text-forest hover:bg-forest/5'
                )}
              >
                {amount} kr
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomSelect}
              className={cn(
                'rounded-lg border px-6 py-3 font-body text-body font-medium',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
                isCustom
                  ? 'border-2 border-forest bg-forest text-cream'
                  : 'border-forest/15 bg-card text-forest hover:bg-forest/5'
              )}
            >
              Egendefinert
            </button>
          </div>

          {isCustom && (
            <div className="mt-4 max-w-[200px]">
              <Input
                label={`Beløp (${MIN_CUSTOM}–${MAX_CUSTOM} kr)`}
                type="number"
                min={MIN_CUSTOM}
                max={MAX_CUSTOM}
                value={customAmount}
                placeholder="f.eks. 750"
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setErrors((prev) => ({ ...prev, amount: '' }))
                }}
                error={errors.amount}
              />
            </div>
          )}

          {!isCustom && errors.amount && (
            <p className="mt-2 text-label text-destructive">{errors.amount}</p>
          )}
        </section>

        {/* Recipient info */}
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Mottaker
          </h2>
          <div className="space-y-4">
            <Input
              label="Mottakers navn"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              error={errors.recipientName}
              required
            />
            <Input
              label="Mottakers e-post"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              error={errors.recipientEmail}
              required
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="gift-message"
                className="text-label font-normal tracking-wide text-forest"
              >
                Personlig hilsen (valgfritt)
              </label>
              <textarea
                id="gift-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Skriv en hilsen til mottakeren..."
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-body text-forest placeholder:text-body/60 focus:border-forest"
              />
            </div>
          </div>
        </section>

        {/* Summary & add to cart */}
        <div className="rounded-xl border border-forest/8 bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="font-body text-body text-forest">Gavekort</span>
            <span className="font-heading text-h4 font-bold text-forest">
              {effectiveAmount > 0 ? formatPrice(amountInOre) : '—'}
            </span>
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleAddToCart}
              disabled={effectiveAmount <= 0}
            >
              <Gift className="h-4 w-4" aria-hidden="true" />
              Legg gavekort i handlekurv
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
