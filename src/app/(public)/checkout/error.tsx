'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-label font-medium uppercase tracking-wider text-body/50">
          Betalingsfeil
        </p>
        <h1 className="mt-2 font-heading text-h2 font-bold text-forest">
          Noe gikk galt i kassen
        </h1>
        <p className="mt-4 max-w-md text-body text-body">
          Det oppstod en feil under betalingen. Handlekurven din er ikke påvirket.
          Prøv igjen, eller kontakt oss hvis problemet vedvarer.
        </p>
        <div className="mt-8">
          <Button onClick={reset}>Prøv igjen</Button>
        </div>
      </div>
    </div>
  )
}
