'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { resetPassword } from '@/lib/firebase/auth'

interface PasswordResetFormProps {
  onSwitchToLogin: () => void
}

export function PasswordResetForm({ onSwitchToLogin }: PasswordResetFormProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setFormError('')
    if (!email.trim()) {
      setEmailError('Oppgi en gyldig e-postadresse.')
      return
    }
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      if (firebaseError.code === 'auth/user-not-found') {
        // Don't reveal if email exists -- show success anyway for security
        setSuccess(true)
      } else if (firebaseError.code === 'auth/invalid-email') {
        setEmailError('Oppgi en gyldig e-postadresse.')
      } else {
        setFormError('Noe gikk galt. Sjekk internettforbindelsen og prover pa nytt.')
      }
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <p className="mb-4 text-body text-forest">
          Vi har sendt en tilbakestillingslenke til {email}. Sjekk innboksen din.
        </p>
        <button
          type="button"
          className="text-label text-forest hover:underline"
          onClick={onSwitchToLogin}
        >
          Tilbake til innlogging
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="mb-4 text-body">
        Oppgi e-postadressen din, sa sender vi deg en lenke for a tilbakestille passordet.
      </p>

      {formError && (
        <FormError id="reset-form-error" message={formError} className="mb-4" />
      )}

      <Input
        label="E-postadresse"
        type="email"
        placeholder="ola@eksempel.no"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        required
        autoComplete="email"
        id="reset-email"
      />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="mt-6 w-full"
      >
        Send tilbakestillingslenke
      </Button>

      <p className="mt-4 text-center text-label text-body">
        <button
          type="button"
          className="text-forest hover:underline"
          onClick={onSwitchToLogin}
        >
          Tilbake til innlogging
        </button>
      </p>
    </form>
  )
}
