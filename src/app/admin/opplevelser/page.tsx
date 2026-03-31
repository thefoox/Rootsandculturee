'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'
import { getAllExperiences, deleteExperience } from '@/actions/experiences'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Experience } from '@/types'

export default function ExperiencesListPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getAllExperiences().then(setExperiences)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteExperience(deleteTarget.id)
    if (result.success) {
      setExperiences((prev) =>
        prev.filter((e) => e.id !== deleteTarget.id)
      )
      toast.success(`${deleteTarget.name} er slettet.`)
    } else {
      toast.error('Kunne ikke slette. Prover pa nytt.')
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const columns: Column<Experience>[] = [
    {
      header: 'Bilde',
      width: '64px',
      accessor: (row) =>
        row.images[0] ? (
          <img
            src={row.images[0].url}
            alt={row.images[0].alt}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-card text-body">
            <Mountain className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
    },
    { header: 'Navn', accessor: 'name' },
    {
      header: 'Sted',
      width: '140px',
      accessor: 'location',
    },
    {
      header: 'Pris',
      width: '100px',
      align: 'right',
      accessor: (row) => (
        <span className="text-forest">{formatPrice(row.basePrice)}</span>
      ),
    },
  ]

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Opplevelser' },
        ]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-h2 font-bold text-forest">
          Opplevelser
        </h1>
        <Link href="/admin/opplevelser/ny">
          <Button variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Legg til opplevelse
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={experiences}
        editHref={(item) => `/admin/opplevelser/${item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        getItemName={(item) => item.name}
        caption="Liste over opplevelser"
        emptyState={{
          icon: Mountain,
          heading: 'Ingen opplevelser enna',
          body: 'Kom i gang ved a legge til din forste opplevelse.',
          ctaLabel: 'Legg til opplevelse',
          ctaHref: '/admin/opplevelser/ny',
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}
