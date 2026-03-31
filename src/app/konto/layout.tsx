import { redirect } from 'next/navigation'
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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-heading text-[28px] font-bold text-forest mb-6">
        Min konto
      </h1>
      <KontoTabs />
      {children}
    </main>
  )
}
