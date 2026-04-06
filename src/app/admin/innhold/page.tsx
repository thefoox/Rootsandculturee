'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import type { PageContent } from '@/types'

export default function SiteContentPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/page-content')
      .then((res) => res.json())
      .then((data) => {
        setPages(data)
        setLoading(false)
      })
  }, [])

  async function handleCreate() {
    if (!newTitle.trim() || !newSlug.trim()) return
    setCreating(true)
    const res = await fetch('/api/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, slug: newSlug }),
    })
    const data = await res.json()
    if (data.success || data.id) {
      window.location.href = `/admin/innhold/${data.id}`
    }
    setCreating(false)
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Sideinnhold' },
        ]}
      />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h2 font-bold text-forest">
            Sideinnhold
          </h1>
          <p className="mt-1 text-body">
            Rediger tekst, bilder og seksjoner på alle sider.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-cream hover:bg-forest/90"
        >
          + Opprett ny side
        </button>
      </div>

      {loading ? (
        <p className="text-body">Laster sider...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-forest/10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-forest/10 bg-card">
                <th className="px-5 py-3 text-label font-medium text-forest">Tittel</th>
                <th className="px-5 py-3 text-label font-medium text-forest">Slug</th>
                <th className="px-5 py-3 text-label font-medium text-forest">Status</th>
                <th className="px-5 py-3 text-label font-medium text-forest">Sist oppdatert</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-forest/5 last:border-0">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/innhold/${page.id}`}
                      className="font-medium text-forest hover:underline"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-body text-body/70">
                    /{page.slug === '/' ? '' : page.slug}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        page.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {page.isPublished ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-body text-body/70">
                    {new Date(page.updatedAt).toLocaleDateString('nb-NO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-cream p-6 shadow-xl">
            <h2 className="font-heading text-h3 font-bold text-forest">
              Opprett ny side
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="page-title" className="mb-1 block text-sm font-medium text-forest">
                  Tittel
                </label>
                <input
                  id="page-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="F.eks. Om oss"
                  className="w-full rounded-lg border border-forest/20 px-3 py-2 text-body focus:border-forest focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="page-slug" className="mb-1 block text-sm font-medium text-forest">
                  Slug (URL-path)
                </label>
                <input
                  id="page-slug"
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="F.eks. om-oss"
                  className="w-full rounded-lg border border-forest/20 px-3 py-2 text-body focus:border-forest focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-forest hover:bg-card"
              >
                Avbryt
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim() || !newSlug.trim()}
                className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest/90 disabled:opacity-50"
              >
                {creating ? 'Oppretter...' : 'Opprett'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
