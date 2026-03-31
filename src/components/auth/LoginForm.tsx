'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { signIn } from '@/lib/firebase/auth'
import { loginAction } from '@/actions/auth'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToReset: () => void
  onSuccess: () => void
}

export function LoginForm({ onSwitchToRegister, onSwitchToReset, onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'Oppgi en gyldig e-postadresse.'
    if (!password.trim()) newErrors.password = 'Oppgi passord.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setErrors({})
    if (!validate()) return
    setLoading(true)

    try {
      // Step 1: Firebase client auth
      const { idToken } = await signIn(email, password)

      // Step 2: Server Action creates jose session cookie
      const result = await loginAction(idToken)
      if (!result.success) {
        setFormError(result.error || 'Noe gikk galt.')
        setLoading(false)
        return
      }

      // Step 3: Refresh server state and close modal (D-11: stay on current page)
      router.refresh()
      onSuccess()
    } catch (err: unknown) {
      // Map Firebase error codes to Norwegian messages
      const firebaseError = err as { code?: string }
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setFormError('Feil e-post eller passord. Prover du igjen?')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setFormError('For mange forsok. Vent litt og prov igjen.')
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrors({ email: 'Oppgi en gyldig e-postadresse.' })
      } else {
        setFormError('Noe gikk galt. Sjekk internettforbindelsen og prover pa nytt.')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <FormError id="login-form-error" message={formError} className="mb-4" />
      )}

      <div className="space-y-4">
        <Input
          label="E-postadresse"
          type="email"
          placeholder="ola@eksempel.no"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          id="login-email"
        />
        <Input
          label="Passord"
          type="password"
          placeholder="Minst 8 tegn"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="current-password"
          id="login-password"
        />
      </div>

      <div className="mt-2 text-right">
        <button
          type="button"
          className="text-[13px] text-body hover:underline"
          onClick={onSwitchToReset}
        >
          Glemt passord?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="mt-6 w-full"
      >
        Logg inn
      </Button>

      <p className="mt-4 text-center text-[13px] text-body">
        Ny her?{' '}
        <button
          type="button"
          className="text-ember hover:underline"
          onClick={onSwitchToRegister}
        >
          Opprett konto
        </button>
      </p>
    </form>
  )
}
