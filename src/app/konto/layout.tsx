import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { verifySession } from '@/lib/dal'
import { KontoTabs } from '@/components/konto/KontoTabs'

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-8 md:pt-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-h2 font-bold text-forest">
          Min konto
        </h1>
        {session.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-label font-medium text-cream hover:bg-forest/90 motion-safe:transition-colors"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Admin
          </Link>
        )}
      </div>
      <KontoTabs />
      {children}
    </div>
  )
}
