'use client'

import { useState, useEffect } from 'react'
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface Version {
  id: string
  title: string
  savedAt: string
  savedBy: string
  sectionCount: number
}

interface VersionHistoryPanelProps {
  pageId: string
  onRevert: (data: {
    title: string
    slug: string
    isPublished: boolean
    showInNavigation: boolean
    navigationOrder: number
    sections: unknown[]
  }) => void
  refreshTrigger: number  // increment to trigger re-fetch
}

export function VersionHistoryPanel({ pageId, onRevert, refreshTrigger }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [reverting, setReverting] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetch(`/api/page-content/${pageId}/versions`)
      .then(r => r.json())
      .then((data: Version[]) => {
        setVersions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [pageId, isOpen, refreshTrigger])

  async function handleRevert(versionId: string) {
    setReverting(versionId)
    try {
      const res = await fetch(`/api/page-content/${pageId}/versions/${versionId}`, {
        method: 'POST',
      })
      if (res.ok) {
        const result = await res.json()
        onRevert(result.data)
        toast.success('Versjonen er gjenopprettet.')
      } else {
        toast.error('Kunne ikke gjenopprette versjonen.')
      }
    } catch {
      toast.error('Noe gikk galt.')
    }
    setReverting(null)
  }

  return (
    <div className="rounded-xl border border-forest/10 bg-cream">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-forest/60" />
          <span className="font-heading text-sm font-bold text-forest">
            Versjonshistorikk
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-body/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-body/50" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-forest/8 px-5 py-4">
          {loading ? (
            <p className="text-sm text-body/60">Laster versjoner...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-body/60">Ingen tidligere versjoner funnet.</p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-forest/8 bg-card/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-forest">
                      {new Date(v.savedAt).toLocaleDateString('nb-NO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-body/50">
                      {v.savedBy} &middot; {v.sectionCount} seksjoner
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevert(v.id)}
                    disabled={reverting !== null}
                    className="inline-flex items-center gap-1 rounded-md border border-forest/15 px-2 py-1 text-xs font-medium text-forest hover:bg-card disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {reverting === v.id ? 'Gjenoppretter...' : 'Gjenopprett'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
