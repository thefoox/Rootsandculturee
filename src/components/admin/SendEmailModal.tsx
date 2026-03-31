'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { sendAdminEmail } from '@/actions/email'
import { toast } from 'sonner'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  recipientEmail: string
}

export function SendEmailModal({
  isOpen,
  onClose,
  recipientEmail,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const subjectRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSubject('')
      setMessage('')
      // Focus subject field after modal opens
      setTimeout(() => subjectRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      toast.error('Fyll ut emne og melding.')
      return
    }
    setIsSending(true)
    const result = await sendAdminEmail(recipientEmail, subject.trim(), message.trim())
    setIsSending(false)

    if (result.success) {
      toast.success(`E-post sendt til ${recipientEmail}.`)
      onClose()
    } else {
      toast.error(result.error || 'Kunne ikke sende e-post.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-dialog-title"
        className="relative z-10 w-full max-w-lg rounded-lg bg-cream p-8 shadow-lg"
      >
        <h2
          id="email-dialog-title"
          className="font-heading text-[20px] font-bold text-forest"
        >
          Send e-post
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="email-to"
              className="block font-body text-[13px] font-medium text-forest"
            >
              Mottaker
            </label>
            <input
              id="email-to"
              type="email"
              value={recipientEmail}
              readOnly
              className="mt-1 block w-full rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-body"
            />
          </div>

          <div>
            <label
              htmlFor="email-subject"
              className="block font-body text-[13px] font-medium text-forest"
            >
              Emne
            </label>
            <input
              ref={subjectRef}
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Angaende din bestilling..."
              className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-[15px] text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div>
            <label
              htmlFor="email-message"
              className="block font-body text-[13px] font-medium text-forest"
            >
              Melding
            </label>
            <textarea
              id="email-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv meldingen din her..."
              className="mt-1 block w-full resize-y rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-[15px] text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={handleSend} loading={isSending}>
            Send e-post
          </Button>
        </div>
      </div>
    </div>
  )
}
