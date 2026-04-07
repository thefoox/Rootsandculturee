import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Mine ordrer — Roots & Culture',
}
import { verifySession } from '@/lib/dal'
import { getOrdersByUser } from '@/lib/data/orders'
import { ShoppingBag } from 'lucide-react'
import { OrderCard } from '@/components/konto/OrderCard'
import { EmptyState } from '@/components/konto/EmptyState'

export default async function OrdrerPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  const orders = await getOrdersByUser(session.uid)

  return (
    <div>
      <h2 className="font-heading text-h4 font-bold text-forest mb-6">
        Mine ordrer
      </h2>
      {orders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          heading="Ingen ordrer enda"
          message="Du har ingen ordrer ennå."
          ctaLabel="Utforsk opplevelser"
          ctaHref="/opplevelser"
        />
      )}
    </div>
  )
}
