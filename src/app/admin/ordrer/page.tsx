'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getOrders } from '@/actions/orders'
import { formatPrice, formatDateMedium } from '@/lib/format'
import type { Order } from '@/types'

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const columns: Column<Order>[] = [
    {
      header: 'Ordrenr.',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-label text-body">
          {row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      header: 'Kunde',
      accessor: (row) => (
        <span className="font-body text-body text-forest">
          {row.customerEmail}
        </span>
      ),
    },
    {
      header: 'Varer',
      width: '80px',
      align: 'center',
      accessor: (row) => (
        <span className="font-body text-label text-body">
          {row.items.length}
        </span>
      ),
    },
    {
      header: 'Total',
      width: '100px',
      align: 'right',
      accessor: (row) => (
        <span className="font-body text-body text-forest">
          {formatPrice(row.total)}
        </span>
      ),
    },
    {
      header: 'Status',
      width: '120px',
      accessor: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      header: 'Dato',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-label text-body">
          {formatDateMedium(row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt))}
        </span>
      ),
    },
    {
      header: 'Handlinger',
      width: '80px',
      accessor: (row) => (
        <Link href={`/admin/ordrer/${row.id}`}>
          <Button
            variant="ghost"
            className="h-auto px-2 py-1 text-label"
            aria-label={`Se ordre ${row.id.slice(0, 8)}`}
          >
            Vis
          </Button>
        </Link>
      ),
    },
  ]

  if (loading) {
    return (
      <div>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Ordrer' },
          ]}
        />
        <h1 className="mb-6 font-heading text-h2 font-bold text-forest">
          Ordrer
        </h1>
        <p className="text-body text-forest">Laster ordrer...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Ordrer' },
          ]}
        />
        <h1 className="mb-6 font-heading text-h2 font-bold text-forest">
          Ordrer
        </h1>
        <EmptyState
          icon=""
          heading="Ingen ordrer enda"
          body="Ordrer vises her etter at kunder har gjennomført kjøp."
        />
      </div>
    )
  }

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Ordrer' },
        ]}
      />
      <h1 className="mb-6 font-heading text-h2 font-bold text-forest">
        Ordrer
      </h1>

      <DataTable
        columns={columns}
        data={orders}
        caption="Liste over ordrer"
        emptyState={{
          icon: '',
          heading: 'Ingen ordrer enda',
          body: 'Ordrer vises her etter at kunder har gjennomført kjøp.',
          ctaLabel: '',
          ctaHref: '#',
        }}
      />
    </div>
  )
}
