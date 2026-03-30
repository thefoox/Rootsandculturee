'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  isDeleting: boolean
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative z-10 w-full max-w-md rounded-lg bg-cream p-8 shadow-lg"
      >
        <h2
          id="delete-dialog-title"
          className="font-heading text-[20px] font-bold text-forest"
        >
          Slett {itemName}?
        </h2>
        <p className="mt-2 text-[15px] text-bark">
          Dette kan ikke angres. Vil du fortsette?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            onClick={onClose}
          >
            Nei, behold
          </Button>
          <Button
            variant="primary"
            className="bg-destructive text-cream hover:bg-destructive/90"
            onClick={onConfirm}
            loading={isDeleting}
          >
            {isDeleting ? 'Sletter...' : 'Ja, slett'}
          </Button>
        </div>
      </div>
    </div>
  )
}
