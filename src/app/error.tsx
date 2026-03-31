'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pt-20">
      <div className="text-center">
        <p className="text-label font-medium uppercase tracking-wider text-body/50">Feil</p>
        <h1 className="mt-2 font-heading text-h2 font-bold text-forest">
          Noe gikk galt
        </h1>
        <p className="mt-4 max-w-md text-body text-body">
          Beklager, det oppstod en feil. Prøv å laste siden på nytt.
        </p>
        <div className="mt-8">
          <Button onClick={reset}>Prøv igjen</Button>
        </div>
      </div>
    </div>
  )
}
