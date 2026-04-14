'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function KontoError({
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <AlertTriangle className="h-10 w-10 text-rust" aria-hidden="true" />
      <p className="mt-4 font-heading text-h4 font-bold text-forest">
        Kunne ikke laste kontoinformasjon
      </p>
      <p className="mt-2 text-body">
        Det oppstod en feil. Prøv å laste siden på nytt.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Prøv igjen</Button>
      </div>
      <Link
        href="/konto"
        className="mt-3 text-label text-forest hover:underline"
      >
        Tilbake til konto
      </Link>
    </div>
  )
}
