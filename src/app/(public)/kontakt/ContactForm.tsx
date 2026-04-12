'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/ui/FormError'
import { submitContactForm, type ContactFormState } from '@/actions/contact'

const initialState: ContactFormState = { success: false }

const subjectOptions = [
  'Velg emne...',
  'Opplevelser',
  'Produkter',
  'Bedrift',
  'Samarbeid',
  'Annet',
]

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  const prevSuccess = useRef(false)
  useEffect(() => {
    if (state?.success && !prevSuccess.current) {
      toast.success('Melding sendt! Vi svarer deg så snart vi kan.')
      formRef.current?.reset()
      prevSuccess.current = true
    }
    if (!state?.success) {
      prevSuccess.current = false
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* 2-column row: name + email */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-[0.8125rem] font-medium text-forest"
          >
            Navn
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ditt navn"
            required
            autoComplete="name"
            className="w-full rounded-[10px] border border-forest/12 bg-cream px-4 py-3.5 text-[0.9375rem] text-body outline-none motion-safe:transition-all placeholder:text-body/50 focus:border-forest focus:shadow-[0_0_0_3px_rgba(27,67,50,0.08)]"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[0.8125rem] font-medium text-forest"
          >
            E-post
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="din@epost.no"
            required
            autoComplete="email"
            className="w-full rounded-[10px] border border-forest/12 bg-cream px-4 py-3.5 text-[0.9375rem] text-body outline-none motion-safe:transition-all placeholder:text-body/50 focus:border-forest focus:shadow-[0_0_0_3px_rgba(27,67,50,0.08)]"
          />
        </div>
      </div>

      {/* Subject select */}
      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-[0.8125rem] font-medium text-forest"
        >
          Emne
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full rounded-[10px] border border-forest/12 bg-cream px-4 py-3.5 text-[0.9375rem] text-body outline-none motion-safe:transition-all focus:border-forest focus:shadow-[0_0_0_3px_rgba(27,67,50,0.08)]"
        >
          {subjectOptions.map((opt) => (
            <option key={opt} value={opt === 'Velg emne...' ? '' : opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Message textarea */}
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-[0.8125rem] font-medium text-forest"
        >
          Melding
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Fortell oss..."
          required
          minLength={10}
          className="min-h-[120px] w-full resize-y rounded-[10px] border border-forest/12 bg-cream px-4 py-3.5 text-[0.9375rem] text-body outline-none motion-safe:transition-all placeholder:text-body/50 focus:border-forest focus:shadow-[0_0_0_3px_rgba(27,67,50,0.08)]"
        />
      </div>

      {state && !state.success && state.error && (
        <FormError id="contact-error" message={state.error} />
      )}

      {/* Submit button: full-width, forest bg */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[10px] bg-forest px-4 py-4 text-[0.9375rem] font-semibold text-cream motion-safe:transition-all hover:-translate-y-px hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending ? 'Sender...' : 'Send melding \u2192'}
      </button>
    </form>
  )
}
