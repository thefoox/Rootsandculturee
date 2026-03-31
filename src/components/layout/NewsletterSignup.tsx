'use client'

import { useActionState } from 'react'
import { subscribeAction, type NewsletterState } from '@/actions/newsletter'

const initialState: NewsletterState = { success: false }

export function NewsletterSignup() {
  const [state, action, pending] = useActionState(subscribeAction, initialState)

  if (state.success) {
    return (
      <div aria-live="polite" className="text-body text-forest/80">
        {state.message}
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          E-postadresse
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="din@epost.no"
          required
          autoComplete="email"
          className="min-h-[44px] flex-1 rounded-md border border-forest/20 bg-card px-3 py-2 text-body text-forest placeholder:text-body/60 focus:border-forest focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded-md bg-forest px-4 py-2 text-body font-medium text-cream transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Sender...' : 'Meld pa'}
        </button>
      </div>
      {state.error && (
        <p role="alert" aria-live="polite" className="text-label text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
