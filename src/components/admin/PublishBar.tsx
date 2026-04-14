'use client'

import { Button } from '@/components/ui/Button'

interface PublishBarProps {
  onSaveDraft: () => void
  onPublish: () => void
  onUnpublish?: () => void
  isPublished: boolean
  isSaving: boolean
  isPublishing: boolean
  contentType: 'product' | 'experience' | 'article' | 'page'
}

export function PublishBar({
  onSaveDraft,
  onPublish,
  onUnpublish,
  isPublished,
  isSaving,
  isPublishing,
  contentType,
}: PublishBarProps) {
  const labels: Record<PublishBarProps['contentType'], { publish: string; unpublish: string }> = {
    product: { publish: 'Publiser', unpublish: 'Avpubliser' },
    experience: { publish: 'Publiser', unpublish: 'Avpubliser' },
    article: { publish: 'Publiser artikkel', unpublish: 'Avpubliser artikkel' },
    page: { publish: 'Publiser side', unpublish: 'Avpubliser side' },
  }
  const publishLabel = labels[contentType].publish
  const unpublishLabel = labels[contentType].unpublish

  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-forest/12 bg-card px-8 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          loading={isSaving}
        >
          {isSaving ? 'Lagrer...' : 'Lagre kladd'}
        </Button>
        {isPublished && onUnpublish && (
          <Button variant="secondary" onClick={onUnpublish}>
            {unpublishLabel}
          </Button>
        )}
      </div>
      <Button
        variant="primary"
        onClick={onPublish}
        loading={isPublishing}
      >
        {isPublishing ? 'Publiserer...' : publishLabel}
      </Button>
    </div>
  )
}
