'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function AuthModal({ isOpen, onClose, title, children }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus first focusable element on open
  useEffect(() => {
    if (isOpen) {
      // Small delay to let modal render
      const timer = setTimeout(() => {
        const firstInput = modalRef.current?.querySelector<HTMLElement>('input, button[type="submit"]')
        firstInput?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        ref={modalRef}
        className="relative z-10 mx-4 w-full max-w-[420px] rounded-lg bg-cream p-8"
      >
        {/* Close button */}
        <button
          ref={closeRef}
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded text-body hover:text-forest"
          onClick={onClose}
          aria-label="Lukk"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Title */}
        <h2
          id="auth-modal-title"
          className="mb-6 font-heading text-[28px] font-bold text-forest"
        >
          {title}
        </h2>

        {children}
      </div>
    </div>
  )
}
