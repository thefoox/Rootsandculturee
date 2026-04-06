'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { submitContactForm, type ContactFormState } from '@/actions/contact'

const initialState: ContactFormState = { success: false }

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Melding sendt! Vi svarer deg så snart vi kan.')
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <Input
        label="Navn"
        name="name"
        type="text"
        placeholder="Ditt fulle navn"
        required
        autoComplete="name"
      />
      <Input
        label="E-post"
        name="email"
        type="email"
        placeholder="din@epost.no"
        required
        autoComplete="email"
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="melding"
          className="text-label font-normal tracking-wide text-forest"
        >
          Melding
        </label>
        <textarea
          id="melding"
          name="message"
          rows={6}
          placeholder="Skriv din melding her..."
          required
          minLength={10}
          className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-body text-forest placeholder:text-body/60 motion-safe:transition-colors motion-safe:duration-100 focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-forest"
        />
      </div>
      {state && !state.success && state.error && (
        <FormError id="contact-error" message={state.error} />
      )}
      <Button type="submit" loading={isPending} className="w-full md:w-auto">
        Send melding
      </Button>
    </form>
  )
}
