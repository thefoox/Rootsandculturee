'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getAllArticles, deleteArticle } from '@/actions/articles'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import type { Article } from '@/types'

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getAllArticles().then(setArticles)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteArticle(deleteTarget.id)
    if (result.success) {
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      toast.success(`${deleteTarget.title} er slettet.`)
    } else {
      toast.error('Kunne ikke slette. Prover pa nytt.')
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const columns: Column<Article>[] = [
    {
      header: 'Bilde',
      width: '64px',
      accessor: (row) =>
        row.coverImage?.url ? (
          <img
            src={row.coverImage.url}
            alt={row.coverImage.alt}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-card text-body">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
        ),
    },
    { header: 'Tittel', accessor: 'title' },
    {
      header: 'Status',
      width: '100px',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Publisert',
      width: '140px',
      accessor: (row) => (
        <span className="text-[13px] text-body">
          {row.publishedAt ? formatDate(row.publishedAt) : '-'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artikler' },
        ]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-[28px] font-bold text-forest">
          Artikler
        </h1>
        <Link href="/admin/artikler/ny">
          <Button variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ny artikkel
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        editHref={(item) => `/admin/artikler/${item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        getItemName={(item) => item.title}
        caption="Liste over artikler"
        emptyState={{
          icon: FileText,
          heading: 'Ingen artikler enna',
          body: 'Kom i gang ved a skrive din forste artikkel.',
          ctaLabel: 'Ny artikkel',
          ctaHref: '/admin/artikler/ny',
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}
