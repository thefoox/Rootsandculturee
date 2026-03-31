import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ReactNode, ElementType } from 'react'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface EmptyStateConfig {
  icon: ElementType
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  editHref?: (item: T) => string
  onDelete?: (item: T) => void
  getItemName?: (item: T) => string
  caption: string
  emptyState: EmptyStateConfig
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  editHref,
  onDelete,
  getItemName,
  caption,
  emptyState,
}: DataTableProps<T>) {
  if (data.length === 0) {
    const Icon = emptyState.icon
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-forest/12 bg-cream p-8">
        <Icon
          className="h-12 w-12 text-rust"
          aria-hidden="true"
        />
        <h3 className="mt-4 font-heading text-[20px] font-bold text-forest">
          {emptyState.heading}
        </h3>
        <p className="mt-2 text-[15px] text-body">{emptyState.body}</p>
        <Link href={emptyState.ctaHref} className="mt-4">
          <Button variant="primary">{emptyState.ctaLabel}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-forest/12 bg-cream">
      <table className="w-full">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="h-[44px] border-b border-forest/12 bg-card">
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 text-[13px] font-normal uppercase tracking-wide text-forest"
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
            {(editHref || onDelete) && (
              <th
                scope="col"
                className="w-[120px] px-4 text-[13px] font-normal uppercase tracking-wide text-forest"
              >
                Handlinger
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const name = getItemName?.(row) || row.id
            return (
              <tr
                key={row.id}
                className="min-h-[52px] border-b border-forest/8 hover:bg-card"
              >
                {columns.map((col, i) => {
                  const value =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as ReactNode)
                  return (
                    <td
                      key={i}
                      className="px-4 py-2 text-[15px] text-forest"
                      style={{
                        width: col.width,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {value}
                    </td>
                  )
                })}
                {(editHref || onDelete) && (
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {editHref && (
                        <Link href={editHref(row)}>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            aria-label={`Rediger ${name}`}
                          >
                            <Pencil
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </Link>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-forest hover:text-destructive"
                          aria-label={`Slett ${name}`}
                        >
                          <Trash2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
