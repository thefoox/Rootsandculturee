'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'
import { getAllProducts, deleteProduct } from '@/actions/products'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Product } from '@/types'

const categoryLabels: Record<string, string> = {
  drikke: 'Drikke',
  'kaffe-te': 'Kaffe & Te',
  naturprodukter: 'Naturprodukter',
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteProduct(deleteTarget.id)
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast.success(`${deleteTarget.name} er slettet.`)
    } else {
      toast.error('Kunne ikke slette. Prover pa nytt.')
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const columns: Column<Product>[] = [
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
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
    },
    { header: 'Navn', accessor: 'name' },
    {
      header: 'Kategori',
      width: '140px',
      accessor: (row) => (
        <span className="rounded-full border border-forest/20 bg-card px-2 py-1 text-label text-body">
          {categoryLabels[row.category] || row.category}
        </span>
      ),
    },
    {
      header: 'Pris',
      width: '100px',
      align: 'right',
      accessor: (row) => (
        <span className="text-forest">{formatPrice(row.price)}</span>
      ),
    },
    {
      header: 'Lager',
      width: '80px',
      align: 'center',
      accessor: (row) => (
        <span className={row.stockCount === 0 ? 'text-destructive' : ''}>
          {row.stockCount}
        </span>
      ),
    },
  ]

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Produkter' },
        ]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-h2 font-bold text-forest">
          Produkter
        </h1>
        <Link href="/admin/produkter/ny">
          <Button variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Legg til produkt
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        editHref={(item) => `/admin/produkter/${item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        getItemName={(item) => item.name}
        caption="Liste over produkter"
        emptyState={{
          icon: Package,
          heading: 'Ingen produkter enna',
          body: 'Kom i gang ved a legge til ditt forste produkt.',
          ctaLabel: 'Legg til produkt',
          ctaHref: '/admin/produkter/ny',
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
