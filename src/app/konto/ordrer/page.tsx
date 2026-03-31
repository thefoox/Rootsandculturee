import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getOrdersByUser } from '@/lib/data/orders'
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
        <EmptyState message="Du har ingen ordrer enna." />
      )}
    </div>
  )
}
