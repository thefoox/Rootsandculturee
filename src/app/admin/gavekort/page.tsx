'use client'

import { useState, useEffect } from 'react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/format'
import { getGiftCardsAdmin, deactivateGiftCardAction } from '@/actions/gift-cards'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { GiftCard } from '@/types'

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  used: 'Brukt',
  expired: 'Utlopt',
}

const statusClasses: Record<string, string> = {
  active: 'bg-badge-easy/10 text-badge-easy',
  used: 'bg-forest/10 text-forest',
  expired: 'bg-destructive/10 text-destructive',
}

export default function AdminGavekortPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGiftCardsAdmin().then((cards) => {
      setGiftCards(cards)
      setLoading(false)
    })
  }, [])

  async function handleDeactivate(code: string) {
    const result = await deactivateGiftCardAction(code)
    if (result.success) {
      setGiftCards((prev) =>
        prev.map((gc) =>
          gc.code === code ? { ...gc, status: 'expired' as const } : gc
        )
      )
      toast.success('Gavekort deaktivert.')
    } else {
      toast.error(result.error || 'Kunne ikke deaktivere gavekortet.')
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Gavekort' },
        ]}
      />
      <h1 className="mb-6 font-heading text-h2 font-bold text-forest">
        Gavekort
      </h1>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-body">
          Laster...
        </div>
      ) : giftCards.length === 0 ? (
        <div className="rounded-lg border border-forest/12 bg-card p-8 text-center">
          <p className="font-body text-body text-body">
            Ingen gavekort er solgt ennå.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-forest/12">
          <table className="w-full text-left">
            <thead className="bg-card">
              <tr>
                <th className="px-4 py-3 text-label font-medium text-forest">Kode</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Beløp</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Saldo</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Status</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Kjøpt av</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Mottaker</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Dato</th>
                <th className="px-4 py-3 text-label font-medium text-forest">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/8">
              {giftCards.map((gc) => (
                <tr key={gc.code} className="bg-cream">
                  <td className="whitespace-nowrap px-4 py-3 font-body text-body font-medium text-forest">
                    {gc.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-body text-forest">
                    {formatPrice(gc.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-body text-forest">
                    {formatPrice(gc.remainingBalance)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-label font-medium',
                        statusClasses[gc.status] || 'bg-forest/10 text-forest'
                      )}
                    >
                      {statusLabels[gc.status] || gc.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-label text-body">
                    {gc.purchaserEmail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-label text-body">
                    {gc.recipientName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-label text-body">
                    {formatDate(gc.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {gc.status === 'active' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleDeactivate(gc.code)}
                      >
                        Deaktiver
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
