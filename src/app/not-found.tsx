import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 pt-20">
      <div className="text-center">
        <p className="text-label font-medium uppercase tracking-wider text-body/50">404</p>
        <h1 className="mt-2 font-heading text-h1 font-bold text-forest">
          Siden ble ikke funnet
        </h1>
        <p className="mt-4 max-w-md text-body text-body">
          Beklager, vi finner ikke siden du leter etter. Den kan ha blitt flyttet eller slettet.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-body font-medium text-cream hover:bg-forest/90"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tilbake til forsiden
        </Link>
      </div>
    </div>
  )
}
