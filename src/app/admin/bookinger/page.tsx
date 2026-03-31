'use client'

import { useState, useEffect, useMemo } from 'react'
import { CalendarCheck, Eye, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { BookingStatusBadge } from '@/components/admin/BookingStatusBadge'
import { BookingFilterRow } from '@/components/admin/BookingFilterRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'
import { getBookingsFiltered, cancelBooking } from '@/actions/bookings'
import { formatDateMedium } from '@/lib/format'
import { toast } from 'sonner'
import type { Booking } from '@/types'

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [selectedExperienceId, setSelectedExperienceId] = useState('')
  const [selectedDateId, setSelectedDateId] = useState('')

  useEffect(() => {
    getBookingsFiltered().then(setBookings)
  }, [])

  // Derive unique experiences from bookings for filter
  const experiences = useMemo(() => {
    const map = new Map<string, string>()
    bookings.forEach((b) => {
      if (!map.has(b.experienceId)) {
        map.set(b.experienceId, b.experienceName)
      }
    })
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [bookings])

  // Derive unique dates from bookings for filter
  const dates = useMemo(() => {
    const map = new Map<string, { id: string; date: Date; experienceId: string }>()
    bookings.forEach((b) => {
      if (!map.has(b.dateId)) {
        map.set(b.dateId, {
          id: b.dateId,
          date: b.date instanceof Date ? b.date : new Date(b.date),
          experienceId: b.experienceId,
        })
      }
    })
    return Array.from(map.values())
  }, [bookings])

  // Client-side filter
  const filteredBookings = useMemo(() => {
    let result = bookings
    if (selectedExperienceId) {
      result = result.filter((b) => b.experienceId === selectedExperienceId)
    }
    if (selectedDateId) {
      result = result.filter((b) => b.dateId === selectedDateId)
    }
    return result
  }, [bookings, selectedExperienceId, selectedDateId])

  async function handleCancel() {
    if (!cancelTarget) return
    setIsCancelling(true)
    const result = await cancelBooking(cancelTarget.id)
    if (result.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTarget.id ? { ...b, status: 'cancelled' as const } : b
        )
      )
      toast.success('Booking kansellert.')
    } else {
      toast.error(result.error || 'Kunne ikke kansellere. Prov igjen.')
    }
    setIsCancelling(false)
    setCancelTarget(null)
  }

  const columns: Column<Booking>[] = [
    {
      header: 'Kode',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-[13px] tracking-[0.04em] text-body">
          {row.confirmationCode}
        </span>
      ),
    },
    {
      header: 'Opplevelse',
      accessor: (row) => (
        <span className="font-body text-[15px] text-forest">
          {row.experienceName}
        </span>
      ),
    },
    {
      header: 'Dato',
      width: '120px',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">
          {formatDateMedium(row.date instanceof Date ? row.date : new Date(row.date))}
        </span>
      ),
    },
    {
      header: 'Kunde',
      width: '160px',
      accessor: (row) => (
        <span className="font-body text-[13px] text-body">
          {row.customerEmail}
        </span>
      ),
    },
    {
      header: 'Status',
      width: '100px',
      accessor: (row) => <BookingStatusBadge status={row.status} />,
    },
    {
      header: 'Handlinger',
      width: '100px',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          {row.status !== 'cancelled' && (
            <button
              onClick={() => setCancelTarget(row)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-body hover:text-[#C0392B]"
              aria-label={`Kanseller booking ${row.confirmationCode}`}
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Bookinger' },
        ]}
      />
      <h1 className="mb-6 font-heading text-[28px] font-bold text-forest">
        Bookinger
      </h1>

      <BookingFilterRow
        experiences={experiences}
        dates={dates}
        selectedExperienceId={selectedExperienceId}
        selectedDateId={selectedDateId}
        onExperienceChange={setSelectedExperienceId}
        onDateChange={setSelectedDateId}
        onReset={() => {
          setSelectedExperienceId('')
          setSelectedDateId('')
        }}
      />

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          heading="Ingen bookinger enda"
          body="Bookinger vises her etter at kunder har reservert plasser."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredBookings}
          caption="Liste over bookinger"
          emptyState={{
            icon: CalendarCheck,
            heading: 'Ingen bookinger enda',
            body: 'Bookinger vises her etter at kunder har reservert plasser.',
            ctaLabel: '',
            ctaHref: '#',
          }}
        />
      )}

      <DeleteConfirmDialog
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        itemName={cancelTarget ? `booking ${cancelTarget.confirmationCode}` : ''}
        isDeleting={isCancelling}
        heading="Kanseller booking?"
        body={cancelTarget ? `Dette varsler ikke kunden automatisk. Vil du kansellere booking ${cancelTarget.confirmationCode}?` : ''}
        confirmLabel="Ja, kanseller"
        cancelLabel="Nei, behold"
      />
    </div>
  )
}
