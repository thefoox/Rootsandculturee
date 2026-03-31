'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ContactForm() {
  const [sending, setSending] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)

    // Simulate sending
    setTimeout(() => {
      setSending(false)
      toast.success('Melding sendt! Vi svarer deg så snart vi kan.')
      const form = e.target as HTMLFormElement
      form.reset()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="text-[13px] font-normal tracking-wide text-forest"
        >
          Melding
        </label>
        <textarea
          id="melding"
          name="message"
          rows={6}
          placeholder="Skriv din melding her..."
          required
          className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-body/60 motion-safe:transition-colors motion-safe:duration-100 focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-forest"
        />
      </div>
      <Button type="submit" loading={sending} className="w-full md:w-auto">
        Send melding
      </Button>
    </form>
  )
}
