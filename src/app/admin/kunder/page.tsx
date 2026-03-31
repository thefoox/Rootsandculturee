'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Eye, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { SendEmailModal } from '@/components/admin/SendEmailModal'
import { getCustomerList } from '@/actions/customers'
import { formatPrice, formatDateMedium } from '@/lib/format'
import type { CustomerSummary } from '@/types'

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [emailTarget, setEmailTarget] = useState<string | null>(null)

  useEffect(() => {
    getCustomerList().then(setCustomers)
  }, [])

  const columns: Column<CustomerSummary>[] = [
    {
      header: 'Navn',
      accessor: (row) => (
        <span className="font-body text-[15px] text-forest">
          {row.displayName || '—'}
        </span>
      ),
    },
    {
      header: 'E-post',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">{row.email}</span>
      ),
    },
    {
      header: 'Ordrer',
      width: '80px',
      align: 'center',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">
          {row.orderCount}
        </span>
      ),
    },
    {
      header: 'Bookinger',
      width: '90px',
      align: 'center',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">
          {row.bookingCount}
        </span>
      ),
    },
    {
      header: 'Total brukt',
      width: '120px',
      align: 'right',
      accessor: (row) => (
        <span className="font-body text-[15px] text-rust">
          {formatPrice(row.totalSpent)}
        </span>
      ),
    },
    {
      header: 'Registrert',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">
          {formatDateMedium(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Handlinger',
      width: '100px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/kunder/${row.uid}`}>
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              aria-label={`Se kunde ${row.displayName || row.email}`}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0"
            onClick={() => setEmailTarget(row.email)}
            aria-label={`Send e-post til ${row.email}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Kunder' },
        ]}
      />
      <h1 className="mb-6 font-heading text-[28px] font-bold text-forest">
        Kunder
      </h1>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          heading="Ingen kunder enda"
          body="Kunder vises her etter at de har opprettet en konto."
        />
      ) : (
        <DataTable
          columns={columns as Column<CustomerSummary & { id: string }>[]}
          data={customers.map((c) => ({ ...c, id: c.uid }))}
          caption="Liste over kunder"
          emptyState={{
            icon: Users,
            heading: 'Ingen kunder enda',
            body: 'Kunder vises her etter at de har opprettet en konto.',
            ctaLabel: '',
            ctaHref: '#',
          }}
        />
      )}

      <SendEmailModal
        isOpen={emailTarget !== null}
        onClose={() => setEmailTarget(null)}
        recipientEmail={emailTarget || ''}
      />
    </div>
  )
}
