'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
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

  useEffect(() => {
    getOrders().then(setOrders)
  }, [])

  const columns: Column<Order>[] = [
    {
      header: 'Ordrenr.',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-[13px] text-bark">
          {row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      header: 'Kunde',
      accessor: (row) => (
        <span className="font-body text-[15px] text-forest">
          {row.customerEmail}
        </span>
      ),
    },
    {
      header: 'Varer',
      width: '80px',
      align: 'center',
      accessor: (row) => (
        <span className="font-body text-[13px] text-bark">
          {row.items.length}
        </span>
      ),
    },
    {
      header: 'Total',
      width: '100px',
      align: 'right',
      accessor: (row) => (
        <span className="font-body text-[15px] text-rust">
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
        <span className="font-body text-[13px] text-bark">
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
            className="h-9 w-9 p-0"
            aria-label={`Se ordre ${row.id.slice(0, 8)}`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      ),
    },
  ]

  if (orders.length === 0) {
    return (
      <div>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Ordrer' },
          ]}
        />
        <h1 className="mb-6 font-heading text-[28px] font-bold text-forest">
          Ordrer
        </h1>
        <EmptyState
          icon={ShoppingCart}
          heading="Ingen ordrer enda"
          body="Ordrer vises her etter at kunder har gjennomfort kjop."
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
      <h1 className="mb-6 font-heading text-[28px] font-bold text-forest">
        Ordrer
      </h1>

      <DataTable
        columns={columns}
        data={orders}
        caption="Liste over ordrer"
        emptyState={{
          icon: ShoppingCart,
          heading: 'Ingen ordrer enda',
          body: 'Ordrer vises her etter at kunder har gjennomfort kjop.',
          ctaLabel: '',
          ctaHref: '#',
        }}
      />
    </div>
  )
}
